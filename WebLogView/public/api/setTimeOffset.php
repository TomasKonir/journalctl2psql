<?php
	require("dbMaintenance.php");
    $id = $_GET["id"];
    $offset = intval($_GET["offset"]) * 60;

    $getQuery = pg_query($db, "SELECT time_offset FROM hostname WHERE id=".$id);
    if($line = pg_fetch_array($getQuery, null, PGSQL_NUM)) {
        $currentOffset = intval($line[0]);
        $diffOffset = $offset - $currentOffset;
        $query = "UPDATE hostname SET time_offset=".$offset." WHERE id=".$id;
    pg_query($db, $query);
        $query = "UPDATE journal SET time=(time + (".$diffOffset." || 'minutes')::interval) WHERE hostname_id=" . $id;
        pg_query($db, $query);
        echo "OK";
    } else {
        echo "ERR";
    }
    pg_close($db);
?>