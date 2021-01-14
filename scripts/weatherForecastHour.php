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
$query = "SELECT f.timestamp,
				 IF((TIME(f.timestamp) >= d.sunrise AND TIME(f.timestamp) <= d.sunset), 1, 0) isday,
                 f.temperature_hist temperature,
				 f.humidity_hist humidity,
				 f.pressure_hist pressure,
				 f.clouds,
				 f.uvi,
				 f.visibility,
				 f.windspeed,
				 f.winddir,
				 f.rain,
				 f.snow,
				 f.description,
				 f.icon,
				 f.alerts
  			FROM $tabweatherforecast f,
			  	 $tabdailyforecast d
 		   WHERE f.timestamp >= NOW()
		     AND DATE(f.timestamp) = d.date
 	    ORDER BY f.TIMESTAMP ASC";
$result = $mysqli->prepare($query);
$result->execute();
/* bind result variables */
$result->bind_result($timestamp, 
                     $isday,
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
		'isday' 		=> $isday,
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