# This is a GNU make file that uses GNU make make extensions

# src.bl makes a clean file named src, but src is a directory, so we must
# tell quickbuild that src is a directory:
CLEANDIRS := src


# After we install nothing here, we do this to install uhd using the build
# system in the uhd package.
POST_INSTALL_COMMAND = cd src/host/BUILD && $(MAKE) install


include ../../quickbuild.make
