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
$query = "SELECT start,
				 end,
				 event,
				 sender_name,
                 description
  			FROM $tabalerts
 		   WHERE start >= NOW()
			  OR end >= NOW()
		 ORDER BY start, end ASC";
		 
$result = $mysqli->prepare($query);
$result->execute();
/* bind result variables */
$result->bind_result(	
					$start, 
					$end,
					$event,
					$sender_name,
					$description
					);
					
/* fetch values */
$weatherForecastAlerts = array();
while ($result->fetch()){
	$weatherForecastAlerts[] = array(
		'start'			=>	$start, 
		'end' 			=>	$end,
		'event' 		=>	$event,
		'sender_name' 	=>	$sender_name,
		'description' 	=>	$description
	);
}

echo json_encode($weatherForecastAlerts);
/* close statement */
$result->close();
/* close connection */
$mysqli->close();
?>