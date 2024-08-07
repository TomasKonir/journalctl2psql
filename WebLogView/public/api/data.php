<?php
require("db.php");
$filterElements = array();
$filter = json_decode($_GET["filter"], true);

$hosts = array();
foreach ($filter["hosts"] as $host) {
    array_push($hosts, $host);
}
if (count($hosts) > 0) {
    array_push($filterElements, "hostname_id IN (" . implode(",", $hosts) . ")");
}

$units = array();
foreach ($filter["units"] as $unit) {
    array_push($units, $unit);
}
if (count($units) > 0) {
    array_push($filterElements, "unit_id IN (" . implode(",", $units) . ")");
}

$identifiers = array();
foreach ($filter["identifier"] as $identifier) {
    array_push($identifiers, $identifier);
}
if (count($identifiers) > 0) {
    array_push($filterElements, "identifier_id IN (" . implode(",", $identifiers) . ")");
}

if (isset($filter["filter"]) && $filter["filter"] != "") {
    array_push($filterElements, "unaccent_immutable(lower(message::text)) LIKE unaccent_immutable(lower('%" . $filter["filter"] . "%'))");
}

if (isset($filter["lastId"]) && $flter["lastId"] != '') {
    array_push($filterElements, "journal.uuid > '" . $filter["lastId"]."'");
}

array_push($filterElements, "uuid >= uuid_from_time_min('" . $filter["from"] . "')");
array_push($filterElements, "uuid <= uuid_from_time_max('" . $filter["to"] . "')");

$where = "";
if (count($filterElements)) {
    $where = "WHERE " . implode(" AND ", $filterElements) . " ";
}

$limit = '';
if ($filter["limit"] > 0) {
    $limit = "LIMIT " . $filter["limit"];
}

$query = "SELECT journal.uuid,uuid_to_time(uuid),hostname,alias,unit,identifier,message FROM journal LEFT JOIN hostname ON hostname.id=hostname_id LEFT JOIN unit ON unit.id=unit_id LEFT JOIN identifier ON identifier.id=identifier_id " . $where . " ORDER BY journal.uuid DESC " . $limit;
//error_log($query);
$data = pg_query($db, $query);
$first = true;
echo "[\n";
while ($line = pg_fetch_array($data, null, PGSQL_NUM)) {
    $hostname = strval($line[3]);
    if (strlen($hostname) == 0) {
        $hostname = strval($line[2]);
    }
    $row = array();
    $row["id"] = strval($line[0]);
    $row["time"] = strval($line[1]);
    $row["host"] = $hostname;
    $row["unit"] = strval($line[4]);
    $row["identifier"] = strval($line[5]);
    $row["message"] = strval($line[6]);
    if ($first) {
        echo "\n";
        $first = false;
    } else {
        echo ",\n";
    }
    echo json_encode($row);
}
echo "\n]\n";
pg_free_result($data);
pg_close($db);
