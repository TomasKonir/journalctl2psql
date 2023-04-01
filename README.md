# journalctl2psql
Simple tool to forward systemd journal to postgresql

Compile as standalone:

mkdir Build; cd Build
qmake ../journalctl2psql.pro
make

Run:
Update config according to your needs from deb-build/build/etc/journalctl2psql.json
./journalctl2psql your-config.json


Build as package:
mkdir Build; cd Build
qmake ../all.pro
make

install package journalctl2psql-ARCH-VERSION.deb
systemctl enable journalctl2psql
EDIT /etc/journalctl2psql.json
systemctl start journalctl2psql
