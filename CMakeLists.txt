cmake_minimum_required(VERSION 3.14)

project(MapProxy LANGUAGES CXX)

set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_BUILD_TYPE Release)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

include(GNUInstallDirs)

find_package(QT NAMES Qt6 REQUIRED COMPONENTS Core Concurrent Sql Network WebSockets)
find_package(Qt${QT_VERSION_MAJOR} REQUIRED COMPONENTS Core Concurrent Sql Network WebSockets)

add_executable(journalctl2psql journalctl2psql.cpp)
target_link_libraries(journalctl2psql Qt${QT_VERSION_MAJOR}::Core Qt${QT_VERSION_MAJOR}::Concurrent Qt${QT_VERSION_MAJOR}::Sql Qt${QT_VERSION_MAJOR}::Network Qt${QT_VERSION_MAJOR}::WebSockets)
install(TARGETS journalctl2psql LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR} RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR})

add_executable(journalctl-websocket journalctl-websocket.cpp)
target_link_libraries(journalctl-websocket Qt${QT_VERSION_MAJOR}::Core Qt${QT_VERSION_MAJOR}::Concurrent Qt${QT_VERSION_MAJOR}::Sql Qt${QT_VERSION_MAJOR}::Network Qt${QT_VERSION_MAJOR}::WebSockets)
install(TARGETS journalctl-websocket LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR} RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR})

add_executable(nxlog-udp-json2psql nxlog-udp-json2psql.cpp)
target_link_libraries(nxlog-udp-json2psql Qt${QT_VERSION_MAJOR}::Core Qt${QT_VERSION_MAJOR}::Concurrent Qt${QT_VERSION_MAJOR}::Sql Qt${QT_VERSION_MAJOR}::Network Qt${QT_VERSION_MAJOR}::WebSockets)
install(TARGETS nxlog-udp-json2psql LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR} RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR})

add_custom_target(deb DEPENDS all)
add_custom_command(TARGET deb POST_BUILD COMMAND ${CMAKE_SOURCE_DIR}/deb-build/mkdeb.sh WORKING_DIRECTORY ${CMAKE_BUILD_DIR})
