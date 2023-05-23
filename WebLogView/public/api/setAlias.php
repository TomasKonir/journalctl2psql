<?php
	require("dbMaintenance.php");
    $id = $_GET["id"];
    $alias = $_GET["alias"];

    $query = "UPDATE hostname SET alias='".$alias."' WHERE id=".$id;
    pg_query($db, $query);
    echo "OK";
    pg_close($db);
?>