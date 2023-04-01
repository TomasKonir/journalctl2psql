TEMPLATE = subdirs

#copy package build files
copydata.commands = rsync -avpx --delete $$PWD/deb-build/ $$OUT_PWD/deb-build/
first.depends = $(first) copydata
export(first.depends)
export(copydata.commands)
QMAKE_EXTRA_TARGETS += first copydata
