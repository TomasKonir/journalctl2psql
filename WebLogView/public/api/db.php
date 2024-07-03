<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
$db = pg_connect("host=localhost dbname=log user=log-reader password=reader") or die('Could not connect: ' . pg_last_error());
