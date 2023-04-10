#!/bin/bash

sudo -u postgres dropdb log
sudo -u postgres dropuser log-maintenance
sudo -u postgres dropuser log-writer
sudo -u postgres dropuser log-reader
