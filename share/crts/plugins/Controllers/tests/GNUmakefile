# This makefile can be used to build any of the modules
# that are at this directory level, share/crts/plugins/.

ROOT := ../../../../../


CPPFLAGS := -I$(ROOT)include -I$(ROOT)lib

INSTALL_DIR = $(PREFIX)/share/crts/plugins/Controller/tests


srcs := $(patsubst %.cpp,%,$(wildcard *.cpp))

# For now just this.
srcs := joystickTxRx


define MkSource
  $(1).so_SOURCES := $(1).cpp
endef
$(foreach src,$(srcs),$(eval $(call MkSource,$(src))))
undefine MkSource
undefine s


joystickTxRx.so_LDFLAGS := -luhd


include $(ROOT)quickbuild.make
