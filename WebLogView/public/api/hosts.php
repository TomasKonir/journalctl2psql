<?php
	require("db.php");
    $ret = array();
    $data = pg_query($db, "SELECT id,hostname,alias FROM hostname ORDER BY hostname");
    while ($line = pg_fetch_array($data, null, PGSQL_NUM)) {
        $hostname = strval($line[2]);
        if (strlen($hostname) == 0) {
            $hostname = strval($line[1]);
        }
        $row = array();
        $row["id"] = intval($line[0]);
        $row["hostname"] = $hostname;
        array_push($ret,$row);
    }
    pg_free_result($data);
    pg_close($db);

    echo json_encode($ret);
    echo "\n"    ;
?>