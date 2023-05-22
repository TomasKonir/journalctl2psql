#include <QCoreApplication>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QSqlDatabase>
#include <QSqlError>
#include <QSqlQuery>
#include <QHostInfo>
#include <QProcess>
#include <QThread>
#include <QFile>
#include <QDebug>
#include <QUdpSocket>
#include <QNetworkDatagram>
#include <signal.h>
#include <unistd.h>

static bool ctrl_c = false;

void ignoreUnixSignals(std::initializer_list<int> ignoreSignals) {
    // all these signals will be ignored.
    for (int sig : ignoreSignals)
        signal(sig, SIG_IGN);
}

void catchUnixSignals(std::initializer_list<int> quitSignals) {
    auto handler = [](int sig) -> void {
        // blocking and not aysnc-signal-safe func are valid
        qInfo() << "Signal:" << sig;
        ctrl_c = true;
    };

    sigset_t blocking_mask;
    sigemptyset(&blocking_mask);
    for (auto sig : quitSignals)
        sigaddset(&blocking_mask, sig);

    struct sigaction sa;
    sa.sa_handler = handler;
    sa.sa_mask    = blocking_mask;
    sa.sa_flags   = 0;

    for (auto sig : quitSignals)
        sigaction(sig, &sa, nullptr);
}

inline void doQuery(QSqlQuery &q){
    if(!q.exec()){
        qInfo() << q.lastQuery();
        qInfo() << "Query exec failed" << q.lastError().databaseText() << q.lastError().databaseText();
        exit(1);
    }
}

int main(int argc, char **argv){
    QCoreApplication app(argc, argv);
    QString dbDriver;
    QString dbHost;
    int     dbPort;
    QString dbUser;
    QString dbPassword;
    QString dbName;
    QStringList addFields;
    int listenPort;

    if(app.arguments().count() < 2){
        qInfo() << "Config paramteter missing";
        return(1);
    }

    catchUnixSignals({SIGQUIT, SIGINT, SIGTERM, SIGHUP});

    QFile config(app.arguments().at(1));
    if(!config.open(QIODevice::ReadOnly)){
        qInfo() << "Unable to open config" << config.fileName();
        return(1);
    }
    QJsonObject o = QJsonDocument::fromJson(config.read(4096)).object();
    dbDriver   = o.value("dbDriver").toString("QPSQL");
    dbHost     = o.value("dbHost").toString("localhost");
    dbPort     = o.value("dbPort").toInt(5432);
    dbUser     = o.value("dbUser").toString("log");
    dbPassword = o.value("dbPassword").toString("log");
    dbName     = o.value("dbName").toString("log");
    listenPort = o.value("listenPort").toInt(1514);

    QSqlDatabase db;
    db = QSqlDatabase::addDatabase(dbDriver);
    db.setHostName(dbHost);
    db.setPort(dbPort);
    db.setUserName(dbUser);
    db.setPassword(dbPassword);
    db.setDatabaseName(dbName);

    if(!db.open()){
        qInfo() << "Unable to connect to database ... sleep 10s, than exit" ;
        QThread::sleep(10);
        return(1);
    }

    QUdpSocket udpServer;
    udpServer.bind(QHostAddress::Any, listenPort);

    QSqlQuery insertQuery(db);
    insertQuery.prepare("SELECT FROM journal_insert(:time,:hostname,:unit,:identifier,:facility,:priority,:pid,:message,:fields,:cursor)");

    int inserts = 0;
    bool inTransaction = false;
    QElapsedTimer et; et.start();
    while(true){
        if(ctrl_c){
            db.commit();
            break;
        }
        udpServer.waitForReadyRead(100);
        if(inserts > 1000 || (et.elapsed() > 1000 && inTransaction)){
            db.commit();
            inTransaction = false;
            inserts = 0;
            et.restart();
        }
        while(udpServer.hasPendingDatagrams()){
            QNetworkDatagram datagram = udpServer.receiveDatagram();
            QJsonObject o = QJsonDocument::fromJson(datagram.data()).object();
            if(o.isEmpty()){
                //qInfo() << "Invalid line";
                continue;
            }

            QString time = o.value("EventTime").toString();
            QString cursor = QString::number(o.value("RecordNumber").toInt());
            QString identifier = o.value("SourceName").toString("EMPTY");
            int facility = o.value("OpcodeValue").toString("-1").toInt();
            int priority = o.value("SeverityValue").toString("-1").toInt();
            qint64 pid = o.value("ProcessID").toString("-1").toInt();
            QString unit = o.value("SourceName").toString("EMPTY");
            QString message = o.value("Message").toString();
            QString hostname = o.value("Hostname").toString();

            QString ip = datagram.senderAddress().toString();
            o.insert("ip",ip);
            QString fields = QString::fromUtf8(QJsonDocument(o).toJson(QJsonDocument::Compact));

            insertQuery.bindValue(":time",time);
            insertQuery.bindValue(":hostname",hostname);
            insertQuery.bindValue(":unit",unit);
            insertQuery.bindValue(":identifier",identifier);
            insertQuery.bindValue(":facility",facility);
            insertQuery.bindValue(":priority",priority);
            insertQuery.bindValue(":pid",pid);
            insertQuery.bindValue(":message",message);
            insertQuery.bindValue(":fields",fields);
            insertQuery.bindValue(":cursor",cursor);
            if(!inTransaction){
                db.transaction();
                inTransaction = true;
            }
            doQuery(insertQuery);
            inserts++;
        }
    }

    db.close();
    return(0);
}
