#!/bin/bash

#create users
sudo -u postgres createuser log-maintenance
sudo -u postgres createuser log-writer
sudo -u postgres createuser log-reader
#set passwords for users
sudo -u postgres psql -c "ALTER USER \"log-maintenance\" PASSWORD 'maintenance'"
sudo -u postgres psql -c "ALTER USER \"log-writer\" PASSWORD 'writer'"
sudo -u postgres psql -c "ALTER USER \"log-reader\" PASSWORD 'reader'"
#create database
sudo -u postgres createdb -O log-maintenance log
