#include <stdio.h>
#include <sys/mman.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <sys/types.h>
#include <unistd.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <inttypes.h>

#include "crts/debug.h"
#include "makeRingBuffer.hpp"


#define TMP_LEN  (64)


//
// We copied this circular (ring) buffer idea from GNU radio.
//
// references:
//
// https://www.gnuradio.org/blog/buffers/
//
// https://github.com/gnuradio/gnuradio/blob/master/gnuradio-runtime/lib/vmcircbuf_mmap_shm_open.cc
//
//

// This makes a "ring buffer" that is made from two memory mappings, where
// the second memory mapping maps addresses at the end of the buffer are
// mapped back to memory at the start address.  It uses a shared memory
// mapped file, but only to force the memory to stay consistent between
// the two mappings.  The shared memory file is closed and unlinked before
// this function returns, so that the shared memory file may never be used
// for another purpose, accidentally or otherwise.   The parameters will
// be increased to the nearest page size (4096 bytes lasted I checked).
//
// After "len" and "overhang" are increased to the nearest page size the
// buffer will looks like:
//
//
//   "start"                                  "mark"                  "end"
//      |------------------ len -----------------|------ overhang ------|
//
//
//
//  where the memory starting at "mark" is mapped to the memory starting
//  at "start".
//
//  "len" should be the longest amount of memory that needs to be stored
//  at any given time.
//
//  "overhang" should be the maximum length that is accessed in a single
//  action.
//

static void bumpSize(size_t &len)
{
    long pagesize;
    ASSERT((pagesize = sysconf(_SC_PAGE_SIZE)) > 1, "");

    if(len > (size_t) pagesize)
    {
        if(len % pagesize)
            len += pagesize - len % pagesize;
    }
    else
        len = pagesize;
}


void *makeRingBuffer(size_t &len, size_t &overhang)
{
    // This is not thread safe.  We expect that this is only
    // called by the main thread.
    //
    static uint32_t segmentCount = 0;

    DASSERT(len >= overhang, "");

    bumpSize(len);
    bumpSize(overhang);

    char tmp[TMP_LEN];
    uint8_t *x;
    int fd;

    snprintf(tmp, TMP_LEN, "/CRTS_ringbuffer_%" PRIu32 "_%d",
            segmentCount, getpid());


    // Using shm_open(), instead of open(), incurs less overhead in use.
    // reference:
    //   https://stackoverflow.com/questions/24875257/why-use-shm-open
    //
    ASSERT((fd = shm_open(tmp, O_RDWR|O_CREAT|O_EXCL, S_IRUSR | S_IWUSR))
            > -1, "shm_open(\"%s\",,) failed", tmp);

    ASSERT(ftruncate(fd, len + overhang) == 0, "ftruncate() failed");

    ASSERT(MAP_FAILED != (x = (uint8_t *) mmap(0, len + overhang,
            PROT_WRITE|PROT_READ, MAP_SHARED,
            fd,  0/*file offset*/)), "mmap() failed");

    // Make a hole of size "overhang" in the mapping.  If we did not make
    // the original mapping larger than we'd have no way to make the
    // second mapping be next to the first mapping.
    ASSERT(0 == munmap(x + len, overhang), "");

    // Fill the hole with the starting memory of the last mapping using
    // the start of the file to make it be at the start.
    //
    // I'd guess that this next mapping could end up not next to the first
    // mapping, but we'll have a failed assertion if it does not.
    ASSERT(x + len == (uint8_t *) mmap(x + len, overhang,
            PROT_WRITE|PROT_READ, MAP_SHARED,
            fd,  0/*file offset*/),
            "mmap() failed to return the address we wanted");

    ASSERT(close(fd) == 0, "");

    ASSERT(shm_unlink(tmp) == 0, "shm_unlink(\"%s\") failed", tmp);

    return x;
}


void freeRingBuffer(void *x, size_t len, size_t overhang)
{
    ASSERT(0 == munmap(x, len), "");
    ASSERT(0 == munmap((uint8_t *) x + len, overhang), "");
}
