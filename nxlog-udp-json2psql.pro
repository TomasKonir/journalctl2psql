QT -= gui
QT += sql network

CONFIG += c++11 console
CONFIG -= app_bundle

TARGET = nxlog-udp-json2psql

DEFINES += QT_DEPRECATED_WARNINGS

SOURCES += nxlog-udp-json2psql.cpp

