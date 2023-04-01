TEMPLATE = subdirs

CONFIG += ordered
CONFIG += c++11

#version
version.commands = $$PWD/version.sh $$OUT_PWD > $$OUT_PWD/version_string.h
first.depends = $(first) version
export(first.depends)
export(version.commands)
QMAKE_EXTRA_TARGETS += first version
#end version

SUBDIRS += deb-prepare.pro
SUBDIRS += journalctl2psql.pro
SUBDIRS += deb-build.pro
deb-build.depends = deb-prepare journalctl2psql
