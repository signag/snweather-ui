<?php
// Include the connect.php file
include 'connect.php';

/*
===============================================
Merge comparison dataset into reference dataset
=============================================== */
function mergeDatasets(&$ref, $cmp, $dsName, $keyType){
    $rLen = sizeof($ref);
    $cLen = sizeof($cmp);

    $i = 0;
    $j = 0;
    while ($i<$rLen) {
        // process reference element
        $rEl = $ref[$i];
        $rKey = $rEl['day_' . $keyType];

        $found = false;
        $stop = false;
        if ($j >= $cLen) {
            $stop = true;
        };
        // find related comparison element
        if ($stop == false) {
            do {
                $cEl = $cmp[$j];
                $cKey = $cEl['day_' . $keyType];
                if ($rKey == $cKey) {
                    $found = true;
                    $stop = true;
                    $j++;
                } elseif ($rKey < $cKey) {
                    $j++;
                    if ($j >= $cLen) {
                        $stop = true;
                    };
                } elseif ($rKey > $cKey) {
                    $stop = true;
                };
            } while ($stop == false);
        };

        if ($found == true) {
            $rEl['temperature_' . $dsName]      = $cEl['temperature'];
            $rEl['pressure_' . $dsName]         = $cEl['pressure'];
            $rEl['humidity_' . $dsName]         = $cEl['humidity'];
            $rEl['fc_temperature_' . $dsName]   = $cEl['fc_temperature'];
            $rEl['fc_pressure_' . $dsName]      = $cEl['fc_pressure'];
            $rEl['fc_humidity_' . $dsName]      = $cEl['fc_humidity'];
        } else {
            $el['temperature_' . $dsName]       = null;
            $rEl['pressure_' . $dsName]         = null;
            $rEl['humidity_' . $dsName]         = null;
            $rEl['fc_temperature_' . $dsName]   = null;
            $rEl['fc_pressure_' . $dsName]      = null;
            $rEl['fc_humidity_' . $dsName]      = null;
        };
       
        $ref[$i] = $rEl;

        $i++;
    };
}


/*
==============================================
Read  measured data from database as reference
============================================== */
function getWeatherDataRef($start, $end)
{
    global $tabweatherdata, $tabweatherforecast, $mysqli;

    // Setup query
    $query = "SELECT w.timestamp,
                     YEAR(w.timestamp)        year,
                     DAYOFYEAR(w.timestamp)   day_year,
                     MONTH(w.timestamp)       month,
                     DAYOFMONTH(w.timestamp)  day_month,
                     WEEK(w.timestamp, 3)     week,
                     WEEKDAY(w.timestamp)     day_week,
                     w.temperature            temperature_ref,
                     w.humidity               humidity_ref,
                     w.pressure               pressure_ref,
                     f.temperature_hist       fc_temperature_ref,
                     f.humidity_hist          fc_humidity_ref,
                     f.pressure_hist          fc_pressure_ref
                FROM $tabweatherdata          w,
                     $tabweatherforecast      f
               WHERE w.timestamp >= '$start'
                 AND w.timestamp <= '$end'
                 AND MINUTE(w.timestamp) = 0
                 AND f.timestamp = w.timestamp
            ORDER BY w.timestamp ASC";

    $result = $mysqli->prepare($query);
    $result->execute();

    // bind result variables
    $result->bind_result(
        $timestamp,
        $year,
        $day_year,
        $month,
        $day_month,
        $week,
        $day_week,
        $temperature_ref,
        $humidity_ref,
        $pressure_ref,
        $fc_temperature_ref,
        $fc_humidity_ref,
        $fc_pressure_ref,
    );

    // fetch values
    $data = array();
    while ($result->fetch()) {
        $data[] = array(
            'timestamp'             => $timestamp,
            'year'                  => $year,
            'day_year'              => $day_year,
            'month'                 => $month,
            'day_month'             => $day_month,
            'week'                  => $week,
            'day_week'              => $day_week,
            'temperature_ref'       => $temperature_ref,
            'humidity_ref'          => $humidity_ref,
            'pressure_ref'          => $pressure_ref,
            'fc_temperature_ref'    => $fc_temperature_ref,
            'fc_humidity_ref'       => $fc_humidity_ref,
            'fc_pressure_ref'       => $fc_pressure_ref,
        );
    };

    // close cursor */
    $result->close();

    // return data
    return $data;
}

/*
=================================
Read  measured data from database
================================= */
function getWeatherData($start, $end)
{
    global $tabweatherdata, $tabweatherforecast, $mysqli;

    // Setup query
    $query = "SELECT w.timestamp,
                     YEAR(w.timestamp)        year,
                     DAYOFYEAR(w.timestamp)   day_year,
                     MONTH(w.timestamp)       month,
                     DAYOFMONTH(w.timestamp)  day_month,
                     WEEK(w.timestamp, 3)     week,
                     WEEKDAY(w.timestamp)     day_week,
                     w.temperature            temperature,
                     w.humidity               humidity,
                     w.pressure               pressure,
                     f.temperature_hist       fc_temperature,
                     f.humidity_hist          fc_humidity,
                     f.pressure_hist          fc_pressure
                FROM $tabweatherdata          w,
                     $tabweatherforecast      f
               WHERE w.timestamp >= '$start'
                 AND w.timestamp <= '$end'
                 AND MINUTE(w.timestamp) = 0
                 AND f.timestamp = w.timestamp
            ORDER BY w.timestamp ASC";

    $result = $mysqli->prepare($query);
    $result->execute();

    // bind result variables
    $result->bind_result(
        $timestamp,
        $year,
        $day_year,
        $month,
        $day_month,
        $week,
        $day_week,
        $temperature,
        $humidity,
        $pressure,
        $fc_temperature,
        $fc_humidity,
        $fc_pressure,
    );

    // fetch values
    $data = array();
    while ($result->fetch()) {
        $data[] = array(
            'timestamp'         => $timestamp,
            'year'              => $year,
            'day_year'          => $day_year,
            'month'             => $month,
            'day_month'         => $day_month,
            'week'              => $week,
            'day_week'          => $day_week,
            'temperature'       => $temperature,
            'humidity'          => $humidity,
            'pressure'          => $pressure,
            'fc_temperature'    => $fc_temperature,
            'fc_humidity'       => $fc_humidity,
            'fc_pressure'       => $fc_pressure,
        );
    };

    // close cursor */
    $result->close();

    // return data
    return $data;
}


/*
=======================
Main
======================= */
// Connect to the database
$mysqli = new mysqli($hostname, $username, $password, $database, $port);
// check connection
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
};

// Get reference data set
$start = date("Y-m") . '-01 00:00:00';
if (isset($_GET['start'])) {
    $start = $_GET['start'];
};
$end = date("Y-m-d") . ' 23:59:59';
if (isset($_GET['end'])) {
    $end = $_GET['end'];
};
$dataset = getWeatherDataRef($start, $end);

// Check for required comparison data sets
if (isset($_GET['compset'])){
    $compSet = $_GET['compset'];
    $compSets = sizeof($compSet);
} else {
    $compSets = 0;
};

$compSetsOk = true;
if ($compSets > 0) {
    // Determin period
    if (isset($_GET['period'])){
        $period = $_GET['period'];
    } else {
        $compSetsOk = false;
    }
    if (isset($_GET['PeriodEnum'])){
        $PeriodEnum = $_GET['PeriodEnum'];
    } else {
        $compSetsOk = false;
    }

    if ($compSetsOk == true) {
        switch($period) {
            case $PeriodEnum['week']:
                $key = 'week';
                break;
            case $PeriodEnum['month']:
                $key = 'month';
                break;
            case $PeriodEnum['year']:
                $key = 'year';
                break;
            default:
                $key = 'none';
        };

        if ($key != 'none'){
            for ($cs=0; $cs < $compSets; $cs++) {
                $dsName = $compSet[$cs]['name'];
                $start  = $compSet[$cs]['start'];;
                $end    = $compSet[$cs]['end'];;

                // Read comparison data
                $datasetAdd = getWeatherData($start, $end);

                // Merge datasets
                mergeDatasets($dataset, $datasetAdd, $dsName, $key);
            };
        };
    };
};

echo json_encode($dataset);
/* close connection */
$mysqli->close();
