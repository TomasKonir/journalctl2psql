#!/bin/bash

echo -n "#define TEKLA_VERSION "
echo "\"$(date "+%Y.%m.%d %H:%M:%S")\""
echo BUILD_BASE=$1 >base.pri
