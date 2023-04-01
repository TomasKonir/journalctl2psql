#!/bin/bash

DEBDIR=$PWD

if [ "$1" != "" ]; then
	pushd $1
else
	echo TARGET DIR NOT SET
	exit
fi

echo SYNCING BINARIES
rsync -avpx ../journalctl2psql build/usr/bin/

if [ "$(which dpkg-architecture)" ==  "" ]; then
	exit 0
fi

ARCH=$(dpkg-architecture | grep DEB_BUILD_ARCH= | cut -f2 -d=)

echo START BUILDING DEB PACKAGE
VERSION=$(date +%Y%m%d%H%M)
unset LD_PRELOAD
unset LD_LIBRARY_PATH

echo GENERATING REPENDENCY
DEPENDS=$(./libs.sh)
echo $DEPENDS
echo PREPARING FILES
find build/ -type f | grep -v DEBIAN | xargs md5sum | sed "s/deb.build.//" >build/DEBIAN/md5sums
cat templates/control | sed "s/#VERSION#/$VERSION/" | sed "s/#SIZE#/$(du -s build | cut -f1)/" | sed "s/#ARCH#/$ARCH/" | sed "s/#DEPENDS#/$DEPENDS/" >build/DEBIAN/control
echo BUILDING PACKAGE
dpkg-deb --build -Zgzip -z9 build
#popd
echo REMOVE OLD FILES
rm -f ../*deb
mv build.deb "../journalctl2psql-$ARCH-$VERSION.deb"
popd
