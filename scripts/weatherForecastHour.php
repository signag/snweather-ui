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
$query = "SELECT timestamp,
                 temperature_hist temperature,
   		 		 humidity_hist humidity,
		 		 pressure_hist pressure,
		 		 clouds,
		 		 uvi,
		 		 visibility,
		 		 windspeed,
		 		 winddir,
				 rain,
				 snow,
				 description,
				 icon,
				 alerts
  			FROM $tabweatherforecast
 		   WHERE timestamp >= NOW()
 	    ORDER BY TIMESTAMP ASC";
$result = $mysqli->prepare($query);
$result->execute();
/* bind result variables */
$result->bind_result($timestamp, 
					 $temperature, 
					 $humidity,
					 $pressure, 
					 $clouds,
					 $uvi,
					 $visibility,
					 $windspeed,
					 $winddir,
					 $rain,
					 $snow,
					 $description,
					 $icon,
					 $alerts
					);
/* fetch values */
while ($result->fetch()){
	$weatherForecastHour[] = array(
		'timestamp' 	=> $timestamp,
		'temperature'	=> $temperature,
		'humidity'		=> $humidity,
		'pressure'		=> $pressure,
		'clouds' 		=> $clouds,
		'uvi' 			=> $uvi,
		'visibility' 	=> $visibility,
		'windspeed'		=> $windspeed,
		'winddir'		=> $winddir,
		'rain'			=> $rain,
		'snow'			=> $snow,
		'description'	=> $description,
		'icon'			=> $icon,
		'alerts'		=> $alerts
	);
}

echo json_encode($weatherForecastHour);
/* close statement */
$result->close();
/* close connection */
$mysqli->close();
?>