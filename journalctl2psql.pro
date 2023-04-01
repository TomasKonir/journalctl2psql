QT -= gui
QT += sql network

CONFIG += c++11 console
CONFIG -= app_bundle

TARGET = journalctl2psql

DEFINES += QT_DEPRECATED_WARNINGS

SOURCES += main.cpp

