<?php
// Include the connect.php file
include ('connect.php');

// Connect to the database
// connection String
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$mysqli = new mysqli($hostname, $username, $password, $database, $port);
/* check connection */
if (mysqli_connect_errno()){
	printf("Connect failed: %s\n", mysqli_connect_error());
	exit();
}
// get range data
$query = "SELECT MAX(temperature), MIN(temperature), MAX(humidity), MIN(humidity), MAX(pressure), MIN(pressure) FROM weatherdata WHERE TIMESTAMP >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
$result2 = $mysqli->prepare($query);
$result2->execute();
/* bind result variables */
$result2->bind_result($temperatureMax, $temperatureMin, $humidityMax, $humidityMin, $pressureMax, $pressureMin);
/* fetch values */
$result2->fetch();
$result2->free_result();

// get current data
$query = "SELECT timestamp, date, time, temperature, humidity, pressure FROM weatherdata WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY) ORDER BY TIMESTAMP DESC LIMIT 0,1";
$result1 = $mysqli->prepare($query);
$result1->execute();
/* bind result variables */
$result1->bind_result($timestamp, $date, $time, $temperature, $humidity, $pressure);
/* fetch values */
$result1->fetch();
$result1->free_result();

// get start timestamp
$query = "SELECT timestamp FROM weatherdata WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY) ORDER BY TIMESTAMP ASC LIMIT 0,1";
$result3 = $mysqli->prepare($query);
$result3->execute();
/* bind result variables */
$result3->bind_result($timestampStart);
/* fetch values */
$result3->fetch();
$result3->free_result();

$weatherDataRange = array(
	'staTimestamp' => $timestampStart,
	'curTimestamp' => $timestamp,
	'curDate' => $date,
	'curTime' => $time,
	'temperatureCur' => $temperature,
	'temperatureMax' => $temperatureMax,
	'temperatureMin' => $temperatureMin,
	'humidityCur' => $humidity,
	'humidityMax' => $humidityMax,
	'humidityMin' => $humidityMin,
	'pressureCur' => $pressure,
	'pressureMax' => $pressureMax,
	'pressureMin' => $pressureMin
);

echo json_encode($weatherDataRange);
/* close statement */
$result1->close();
$result2->close();
$result3->close();
/* close connection */
$mysqli->close();
?>