<?php
    $db = pg_connect("host=localhost dbname=log user=log-maintenance password=maintenance") or die('Could not connect: ' . pg_last_error());
?>