<?php
// Include the connect.php file
include ('connect.php');

// Connect to the database
// connection String
$mysqli = new mysqli($hostname, $username, $password, $database, $port);
/* check connection */
if (mysqli_connect_errno()){
	printf("Connect failed: %s\n", mysqli_connect_error());
	exit();
}
// get list data and store in a json array
$query = "SELECT w.TIMESTAMP, w.date, w.time, w.temperature, w.humidity, w.pressure, f.temperature fc_temperature, f.humidity fc_humidity, f.pressure fc_pressure FROM weatherdata w, weatherforecast f WHERE w.timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY) AND f.timestamp = w.timestamp ORDER BY TIMESTAMP ASC;";
$result = $mysqli->prepare($query);
$result->execute();
/* bind result variables */
$result->bind_result($timestamp, $date, $time, $temperature, $humidity, $pressure, $fc_temperature, $fc_humidity, $fc_pressure);
/* fetch values */
while ($result->fetch()){
	$weatherDataList[] = array(
		'timestamp' => $timestamp,
		'date' => $date,
		'time' => $time,
		'temperature' => $temperature,
		'humidity' => $humidity,
		'pressure' => $pressure,
		'fc_temperature' => $fc_temperature,
		'fc_humidity' => $fc_humidity,
		'fc_pressure' => $fc_pressure
	);
}

echo json_encode($weatherDataList);
/* close statement */
$result->close();
/* close connection */
$mysqli->close();
?>