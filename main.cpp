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


QStringList arrayToStringList(QJsonArray a){
    QStringList ret;
    foreach(QJsonValue v, a){
        if(v.isString()){
            ret << v.toString();
        }
    }
    return(ret);
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
    QString hostname = QHostInfo::localHostName();

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
    addFields  = arrayToStringList(o.value("addFields").toArray());

    QSqlDatabase db = QSqlDatabase::addDatabase(dbDriver);
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

    if(!db.tables().contains("journal")){
        db.exec("CREATE TABLE journal("
                "id BIGSERIAL NOT NULL UNIQUE,"
                "time TIMESTAMP NOT NULL,"
                "hostname VARCHAR NOT NULL,"
                "cursor VARCHAR NOT NULL,"
                "identifier VARCHAR NOT NULL,"
                "facility INT NOT NULL,"
                "priority INT NOT NULL,"
                "pid BIGINT NOT NULL,"
                "unit VARCHAR NOT NULL,"
                "message VARCHAR,"
                "fields JSONB)");
        db.exec("CREATE INDEX journal_base_idx ON journal(hostname,time,cursor)");
    }

    QStringList journalctlParams({"-f","-o","json"});
    QSqlQuery lastLogQuery(db);
    lastLogQuery.prepare("SELECT cursor FROM journal WHERE hostname=:hostname ORDER BY id DESC LIMIT 1");
    lastLogQuery.addBindValue(hostname);
    doQuery(lastLogQuery);
    if(lastLogQuery.next()){
        journalctlParams << "--after-cursor" << lastLogQuery.value(0).toString();
    } else {
        journalctlParams << "--since" << "2007-08-28 00:00:00";
    }

    QProcess journalctl;
    journalctl.setReadChannel(QProcess::StandardOutput);
    journalctl.start("journalctl",journalctlParams);
    if(!journalctl.waitForStarted()){
        qInfo() << "Unable to start journalctl";
        exit(1);
    }

    qInfo() << "Journalctl started with args:" << journalctlParams.join(" ");
    QSqlQuery insertQuery(db);
    insertQuery.prepare("INSERT INTO journal(time,hostname,cursor,identifier,facility,priority,pid,unit,message,fields) VALUES(TO_TIMESTAMP(:time),:hostname,:cursor,:identifier,:facility,:priority,:pid,:unit,:message,:fields)");

    int inserts = 0;
    QElapsedTimer et; et.start();
    db.transaction();
    while(true){
        if(ctrl_c){
            db.commit();
            break;
        }
        journalctl.waitForReadyRead(100);
        while(journalctl.canReadLine()){
            QJsonObject o = QJsonDocument::fromJson(journalctl.readLine()).object();
            if(o.isEmpty()){
                //qInfo() << "Invalid line";
                continue;
            }
            QString time = o.value("_SOURCE_REALTIME_TIMESTAMP").toString();
            QString cursor = o.value("__CURSOR").toString();
            QString identifier = o.value("SYSLOG_IDENTIFIER").toString("EMPTY");
            int facility = o.value("SYSLOG_FACILITY").toString("-1").toInt();
            int priority = o.value("PRIORITY").toString("-1").toInt();
            qint64 pid = o.value("_PID").toString("-1").toInt();
            QString unit = o.value("_SYSTEMD_UNIT").toString("EMPTY");
            QString message = o.value("MESSAGE").toString();
            QString fields;

            if(cursor.length() == 0){
                continue;
            }

            if(addFields.length()){
                QJsonObject ii;
                foreach(QString s, addFields){
                    if(o.contains(s)) {
                        ii.insert(s,o.value(s));
                    }
                }
                fields = QString::fromUtf8(QJsonDocument(ii).toJson(QJsonDocument::Compact));
            }

            if(time.length() == 0){
                time = o.value("__REALTIME_TIMESTAMP").toString();
            }
            if(time.length() > 6){
                time.insert(time.length() - 6,".");
            } else {
                //qInfo() << "Invalid time" << o;
                continue;
            }

            insertQuery.addBindValue(time);
            insertQuery.addBindValue(hostname);
            insertQuery.addBindValue(cursor);
            insertQuery.addBindValue(identifier);
            insertQuery.addBindValue(facility);
            insertQuery.addBindValue(priority);
            insertQuery.addBindValue(pid);
            insertQuery.addBindValue(unit);
            insertQuery.addBindValue(message);
            insertQuery.addBindValue(fields);
            doQuery(insertQuery);
            if(inserts++ > 1000 || et.elapsed() > 10000){
                db.commit();
                db.transaction();
                inserts = 0;
                et.restart();
            }
        }
        journalctl.readAllStandardError();
        if(journalctl.state() != QProcess::Running){
            qInfo() << "Journalctl finished";
            db.commit();
            return(1);
        }
    }
    db.close();
    return(0);
}
