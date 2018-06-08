
# TODO: In looking at the liquid-dsp ofdmflexframegen and
# ofdmflexframesync code we see it hammers the libc memory allocator
# (realloc, malloc, and free) and does an lot of unnecessary memory copies
# when it is running at steady state.  It is happening in the inner most
# loop.  A simple size change flag check may speed it up this code 10
# fold, so it checks to see if it needs to reallocate memory before just
# reallocating memory for no reason at every frame.


CLEANERDIRS := $(wildcard BUILD_nodejs-*)

# We wish to have things accessed/built/installed in this order
# so we override subdirs that is auto-generated by quickbuild.make:
SUBDIRS :=\
 liquid-dsp\
 demo_launcher\
 include\
 lib\
 bin\
 share\
 etc\
 htdocs\
 interactiveTests


# The program crts_mkTUN needs a special installation so it can startup as
# effective user root and create a TUN device and route it, and then it
# goes back to being a regular user.  We could have added this as the last
# part of the "install" target but we wanted to keep the basic install as
# a non-root thing, with no root access required.  We think that having a
# software build system require "root" access is a very bad thing.  We are
# not building an operating system, we are building files.  Operating
# system (OS) package management is not the same as a software building.
# You should never have to blindly run "sudo make install" unless you are
# building core OS packages, like the kernel.
#
# You can run 'make sudo_install' or 'make root_install' as root; or not
# at all if you are not using the modules that use the TUN.
#

# The "special program":
crts_mkTUN = $(PREFIX)/bin/crts_mkTUN


sudo_install:
	sudo chown root:root $(crts_mkTUN)
	sudo chmod u+s $(crts_mkTUN)

# If you do not have the sudo program installed you can run 'make
# root_install' as root to run this make target:
root_install:
	chown root:root $(crts_mkTUN)
	chmod u+s $(crts_mkTUN)


include ./quickbuild.make
