<?php
// Include the connect.php file
include ('connect.php');

function transpose(array $ar) {
	$res = array();
	
	$akeys = array_keys($ar[0]);

	$key = array('property');
	$len = sizeof($ar);
	for ($i=1; $i<=$len; $i++){
		array_push($key, 'day_' .sprintf("%'.02d", $i));
	}

	for ($i=0; $i<sizeof($akeys); $i++){
		$col = array_column($ar, $akeys[$i]);
		array_unshift($col, $akeys[$i]);
		$row = array_combine($key, $col);
		$res[$i] = $row;
	}

	return $res;
}

// Connect to the database
// connection String
$mysqli = new mysqli($hostname, $username, $password, $database, $port);
/* check connection */
if (mysqli_connect_errno()){
	printf("Connect failed: %s\n", mysqli_connect_error());
	exit();
}
// get list data and store in a json array
$query = "SELECT date,
				 sunrise,
				 sunset,
                 temperature_m,
                 temperature_d,
                 temperature_e,
                 temperature_n,
                 temperature_min,
                 temperature_max,
				 pressure,
   		 		 humidity,
				 windspeed,
		 		 winddir,
		 		 clouds,
		 		 uvi,
		 		 pop,
				 rain,
				 snow,
				 description,
				 icon,
				 alerts
  			FROM $tabdailyforecast
 		   WHERE date >= DATE_ADD(NOW(), INTERVAL -1 DAY)
		 ORDER BY date ASC";
		 
$result = $mysqli->prepare($query);
$result->execute();
/* bind result variables */
$result->bind_result(	
					$date, 
					$sunrise,
					$sunset,
					$temperature_m,
					$temperature_d,
					$temperature_e,
					$temperature_n,
					$temperature_min,
					$temperature_max,
					$pressure,
					$humidity,
					$windspeed,
					$winddir,
					$clouds,
					$uvi,
					$pop,
					$rain,
					$snow,
					$description,
					$icon,
					$alerts
					);
					
/* fetch values */
while ($result->fetch()){
	$weatherForecastDay[] = array(
		'date' 				=>	$date, 
		'sunrise' 			=>	$sunrise,
		'sunset' 			=>	$sunset,
		'temperature_m' 	=>	$temperature_m,
		'temperature_d' 	=>	$temperature_d,
		'temperature_e' 	=>	$temperature_e,
		'temperature_n' 	=>	$temperature_n,
		'temperature_min'	=>	$temperature_min,
		'temperature_max' 	=>	$temperature_max,
		'pressure' 			=>	$pressure,
		'humidity' 			=>	$humidity,
		'windspeed' 		=>	$windspeed,
		'winddir' 			=>	$winddir,
		'clouds' 			=>	$clouds,
		'uvi' 				=>	$uvi,
		'pop' 				=>	$pop,
		'rain' 				=>	$rain,
		'snow' 				=>	$snow,
		'description' 		=>	$description,
		'icon' 				=>	$icon,
		'alerts' 			=>	$alerts
	);
}

$weatherForecastDay_t = transpose($weatherForecastDay);

echo json_encode($weatherForecastDay_t);
/* close statement */
$result->close();
/* close connection */
$mysqli->close();
?>