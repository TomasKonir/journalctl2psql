<?php
    $db = pg_connect("host=localhost dbname=log user=log-reader password=reader") or die('Could not connect: ' . pg_last_error());
?>