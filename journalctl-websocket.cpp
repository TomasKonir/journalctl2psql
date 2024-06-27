#include <QCoreApplication>
#include <QTimer>
#include <QSqlDatabase>
#include <QSqlQuery>
#include <QSqlError>
#include <QWebSocketServer>
#include <QWebSocket>
#include <QList>
#include <QDebug>

QWebSocketServer server("log-server",QWebSocketServer::NonSecureMode);
QList<QWebSocket *> connections;



void disconnected(){
    for(const auto &s: connections){
        if(s->state() != QAbstractSocket::ConnectedState){
            delete s;
            connections.removeAll(s);
        }
    }
}

void newConnection(){
    while(server.hasPendingConnections()){
        QWebSocket *s = server.nextPendingConnection();
        s->connect(s, &QWebSocket::disconnected, disconnected);
        connections << s;
    }
}

int main(int argc, char **argv){
    QCoreApplication app(argc,argv);
    if(!server.listen(QHostAddress("127.0.0.1"),8443)){
        qInfo() << "Unable to listen";
        return(-1);
    }
    app.connect(&server,&QWebSocketServer::newConnection,newConnection);
    return(app.exec());
}
