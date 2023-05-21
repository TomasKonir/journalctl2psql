#!/bin/bash

if [ "$1" == "" ]; then
	echo usage: $0 imageFile
fi

for i in 48 72 96 120 128 144 152 180 192 200 384 512; do
	convert "$1" -resize $ix$i logo$i.png
done
convert "$1" -resize 128x128 favicon.ico