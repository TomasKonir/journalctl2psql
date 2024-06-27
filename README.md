# journalctl2psql
Simple tool to forward systemd journal to postgresql

QT development packages are required to build

Standalone:

-- compile --

    mkdir Build; cd Build
    qmake ../journalctl2psql.pro
    make

-- run --

    Update config according to your needs from deb-build/build/etc/journalctl2psql.json
    ./journalctl2psql your-config.json
//Standalone

Package:

-- compile --

    mkdir Build; cd Build
    cmake ../
    make

-- install and run --

    install package journalctl2psql-ARCH-VERSION.deb
    systemctl enable journalctl2psql
    EDIT /etc/journalctl2psql.json
    systemctl start journalctl2psql

//Package
