TEMPLATE = subdirs

CONFIG += ordered
CONFIG += c++11

deb.commands = $$OUT_PWD/deb-build/mkdeb.sh $$OUT_PWD/deb-build
first.depends = $(first) deb
export(first.depends)
export(deb.commands)
QMAKE_EXTRA_TARGETS += first deb
