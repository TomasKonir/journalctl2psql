<?php
	require("db.php");
    $ret = array();
    $data = pg_query($db, "SELECT id,hostname,alias,time_offset FROM hostname ORDER BY hostname");
    while ($line = pg_fetch_array($data, null, PGSQL_NUM)) {
        $displayname = strval($line[2]);
        if (strlen($displayname) == 0) {
            $displayname = strval($line[1]);
        }
        $row = array();
        $row["id"] = intval($line[0]);
        $row["hostname"] = $line[1];
        $row["alias"] = $line[2];
        $row["time_offset"] = intval($line[3]) / 60;
        $row["displayname"] = $displayname;
        array_push($ret,$row);
    }
    pg_free_result($data);
    pg_close($db);

    echo json_encode($ret);
    echo "\n"    ;
?>