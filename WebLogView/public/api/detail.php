<?php
	require("db.php");
    $id = $_GET["id"];

    $query = "SELECT id,time,jsonb_pretty(fields) FROM journal WHERE id=".$id;
    //error_log($query);
    $data = pg_query($db, $query);
    if ($line = pg_fetch_array($data, null, PGSQL_NUM)) {
        $row = array();
        $row["id"] = intval($line[0]);
        $row["time"] = strval($line[1]);
        $row["fields"] = strval($line[2]);
        echo json_encode($row);
    }
    pg_free_result($data);
    pg_close($db);
?>