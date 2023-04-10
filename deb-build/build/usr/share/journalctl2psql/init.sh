#!/bin/bash

./init-base.sh
psql postgresql://log-maintenance:maintenance@localhost/log < init-db.sql
