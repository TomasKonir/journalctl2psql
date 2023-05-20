<?php
	require("db.php");
    $ret = array();
    $data = pg_query($db, "SELECT id,hostname FROM hostname ORDER BY hostname");
    while ($line = pg_fetch_array($data, null, PGSQL_NUM)) {
        $row = array();
        $row["id"] = intval($line[0]);
        $row["hostname"] = strval($line[1]);
        array_push($ret,$row);
    }
    pg_free_result($data);
    pg_close($db);

    echo json_encode($ret);
    echo "\n"    ;
?>