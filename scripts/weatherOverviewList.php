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

$start = date("Y-m") . '-01 00:00:00';
if (isset($_GET['start'])) {
	$start = $_GET['start'];
}
$end   = date("Y-m-d") . ' 23:59:59';
if (isset($_GET['end'])) {
	$end = $_GET['end'];
}

// get list data and store in a json array
$query = "SELECT w.TIMESTAMP,
                 w.date,
   		 		 w.time,
		 		 w.temperature,
		 		 w.humidity,
		 		 w.pressure,
		 		 f.temperature_hist fc_temperature,
		 		 f.humidity_hist    fc_humidity,
		 		 f.pressure_hist    fc_pressure
  			FROM $tabweatherdata w,
       			 $tabweatherforecast f
 		   WHERE w.timestamp >= '$start'
			 AND w.timestamp <= '$end'
   		     AND f.timestamp = w.timestamp
			 AND MINUTE(f.timestamp) = 0
		 ORDER BY TIMESTAMP ASC";
		 
$result = $mysqli->prepare($query);
$result->execute();

/* bind result variables */
$result->bind_result($timestamp, 
					 $date, 
					 $time, 
					 $temperature, 
					 $humidity, 
					 $pressure, 
					 $fc_temperature, 
					 $fc_humidity, 
					 $fc_pressure);
					 
/* fetch values */
while ($result->fetch()){
	$weatherDataList[] = array(
		'timestamp'			=> $timestamp,
		'date' 				=> $date,
		'time' 				=> $time,
		'temperature' 		=> $temperature,
		'humidity' 			=> $humidity,
		'pressure' 			=> $pressure,
		'fc_temperature'	=> $fc_temperature,
		'fc_humidity' 		=> $fc_humidity,
		'fc_pressure' 		=> $fc_pressure
	);
}

echo json_encode($weatherDataList);
/* close statement */
$result->close();
/* close connection */
$mysqli->close();
?>