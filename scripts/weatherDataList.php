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
$query = "SELECT timestamp, date, time, temperature, humidity, pressure FROM weatherdata WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY) ORDER BY TIMESTAMP ASC ";
$result = $mysqli->prepare($query);
$result->execute();
/* bind result variables */
$result->bind_result($timestamp, $date, $time, $temperature, $humidity, $pressure);
/* fetch values */
while ($result->fetch()){
	$weatherDataList[] = array(
		'timestamp' => $timestamp,
		'date' => $date,
		'time' => $time,
		'temperature' => $temperature,
		'humidity' => $humidity,
		'pressure' => $pressure
	);
}

echo json_encode($weatherDataList);
/* close statement */
$result->close();
/* close connection */
$mysqli->close();
?>