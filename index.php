<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />	
    <title id='Description'>Weatherstation</title>
    <link rel="stylesheet" href="styles/jqx.base.css" type="text/css" />
    <link rel="stylesheet" href="styles/snweather.css" type="text/css" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <script type="text/javascript" src="scripts/jqwidgets/jquery.min.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxcore.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxdata.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxchart.core.js"></script>
	<script type="text/javascript" src="scripts/jqwidgets/jqxchart.js"></script>	
    <script type="text/javascript" src="scripts/jqwidgets/jqxdraw.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxbuttons.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxcheckbox.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxradiobutton.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxradiobutton.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxgauge.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxscrollbar.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxmenu.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxgrid.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxgrid.selection.js"></script>	
    <script type="text/javascript" src="scripts/jqwidgets/jqxgrid.filter.js"></script>		
    <script type="text/javascript" src="scripts/jqwidgets/jqxlistbox.js"></script>	
    <script type="text/javascript" src="scripts/jqwidgets/jqxdropdownlist.js"></script>	

    <script type="text/javascript">
        $(document).ready(function () {
            // ==================================================================================
            // Set up thermometer
            $('#thermometer').jqxLinearGauge({
                orientation: 'vertical',
                width: 200,
                height: 316,
                ticksMajor: { size: '15%', interval: 5 },
                ticksMinor: { size: '8%', interval: 1, style: { 'stroke-width': 1, stroke: '#aaaaaa'} },
                max: 40,
                min: -30,
                pointer: { 
                    size: '5%',
                    style: {
                        fill: '#000000'
                    }
                },
                colorScheme: 'scheme05',
                labels: { interval: 10, formatValue: function (value, position) {
                    return value + '°C';
                    }
                },
                animationDuration: 500
            });

            // ==================================================================================
            // Set up barometer
            $('#barometer').jqxGauge({
                width: 316,
                height: 316,
                radius: 160,
                startAngle: 60,
                endAngle: 360,
                ticksMajor: { size: '10%', interval: 10, style: { stroke: '#898989'}, visible: true },
                ticksMinor: { size: '6%', interval: 1, style: { stroke: '#898989'}, visible: true },
                max: 1080,
                min: 950,
                pointer: { 
                    style: {
                        fill: '#000000'
                    }
                },
                labels: { position: 'inside', interval: 10},
                colorScheme: 'scheme05',
                caption: { value: 'hPa', position: 'bottom', offset: [0, 30], visible: true},
                animationDuration: 500
            });
            var bRanges = [
                {startValue: 950, endValue: 990, style: {fill: '#0000ff', stroke: '#000000'}},
                {startValue: 990, endValue: 1040, style: {fill: '#ffff00', stroke: '#000000'}},
                {startValue: 1040, endValue: 1080, style: {fill: '#ff4000', stroke: '#000000'}}
            ];
            $('#barometer').jqxGauge({ ranges: bRanges });

            // ==================================================================================
            // Set up hygrometer
            $('#hygrometer').jqxGauge({
                width: 316,
                height: 316,
                radius: 160,
                startAngle: 50,
                endAngle: 330,
                ticksMajor: { size: '10%', interval: 10, style: { stroke: '#898989'}, visible: true },
                ticksMinor: { size: '6%', interval: 1, style: { stroke: '#898989'}, visible: true },
                max: 100,
                min: 0,
                pointer: { 
                    size: '5%',
                    style: {
                        fill: '#000000'
                    }
                },
                labels: { position: 'inside', interval: 10},
                colorScheme: 'scheme05',
                caption: { value: '%', position: 'bottom', offset: [0, 30], visible: true},
                animationDuration: 500
            });
            var hRanges = [
                {startValue: 0, endValue: 35, style: {fill: '#ff4000', stroke: '#000000'}},
                {startValue: 35, endValue: 65, style: {fill: '#40ff00', stroke: '#000000'}},
                {startValue: 65, endValue: 100, style: {fill: '#0000ff', stroke: '#000000'}}
            ];
            $('#hygrometer').jqxGauge({ ranges: hRanges });

            // ==================================================================================
            // get range data
            var sourceRange = {
                datatype: "json",
                datafields: [
                    { name: 'staTimestamp', type: 'date'},
                    { name: 'curTimestamp', type: 'date'},
                    { name: 'curDate'},
                    { name: 'curTime'},
                    { name: 'temperatureCur'},
                    { name: 'temperatureMax'},
                    { name: 'temperatureMin'},
                    { name: 'humidityCur'},
                    { name: 'humidityMax'},
                    { name: 'humidityMin'},
                    { name: 'pressureCur'},
                    { name: 'pressureMax'},
                    { name: 'pressureMin'},
                ],
                url: 'scripts/weatherDataRange.php'
            };

            // ==================================================================================
            // Update thermometer, barometer and hygrometer with measurement data
		    var dataAdapterRange = new $.jqx.dataAdapter(sourceRange, {
                loadComplete: function() {
                    var records = dataAdapterRange.records;
                    var length = records.length;
                    if (length > 0) {
                        var record = records[0];

                        // Update measurement time
                        document.getElementById("measurement").innerHTML
                            = "Messwerte vom "
                            + record.curTimestamp.toLocaleDateString('de-DE') + " um " 
                            + record.curTimestamp.toLocaleTimeString('de-DE') + " Uhr"
                        // Update thermometer
                        var tRanges = [{
                            startValue: record.temperatureMin,
                            endValue: record.temperatureMax,
                            style: {
                                fill: '#999999',
                                stroke: '#999999'
                            }
                        }];
                        $('#thermometer').jqxLinearGauge({ ranges: tRanges });
                        $('#thermometer').jqxLinearGauge('value', record.temperatureCur);
                        document.getElementById("tempCur").innerHTML = record.temperatureCur + " °C"

                        // Update barometer
                        var bRanges = [
                            {startValue: 950, endValue: 990, style: {fill: '#0000ff', stroke: '#000000'}},
                            {startValue: 990, endValue: 1040, style: {fill: '#ffff00', stroke: '#000000'}},
                            {startValue: 1040, endValue: 1080, style: {fill: '#ff4000', stroke: '#000000'}},
                            {startValue: record.pressureMin, endValue: record.pressureMax, style: {fill: '#999999', stroke: '#999999'}, startDistance: 22, endDistance: 22}
                        ];
                        $('#barometer').jqxGauge({ ranges: bRanges });
                        $('#barometer').jqxGauge('value', record.pressureCur);
                        document.getElementById("presCur").innerHTML = record.pressureCur + " hPa"

                        // Update hygrometer
                        var hRanges = [
                            {startValue: 0, endValue: 35, style: {fill: '#ff4000', stroke: '#000000'}},
                            {startValue: 35, endValue: 65, style: {fill: '#40ff00', stroke: '#000000'}},
                            {startValue: 65, endValue: 100, style: {fill: '#0000ff', stroke: '#000000'}},
                            {startValue: record.humidityMin, endValue: record.humidityMax, style: {fill: '#999999', stroke: '#999999'}, startDistance: 22, endDistance: 22}
                        ];
                        $('#hygrometer').jqxGauge({ ranges: hRanges });
                        $('#hygrometer').jqxGauge('value', record.humidityCur);
                        document.getElementById("humiCur").innerHTML = record.humidityCur + " %"
                    }
                }
            });

            // Get data from data source for range date
            dataAdapterRange.dataBind();

            // ==================================================================================
            // get list data
            var sourceList = {
                datatype: "json",
                datafields: [
                    { name: 'timestamp', type: 'date'},
                    { name: 'date'},
                    { name: 'time'},
                    { name: 'temperature'},
                    { name: 'humidity'},
                    { name: 'pressure'},
                    { name: 'fc_temperature'},
                    { name: 'fc_humidity'},
                    { name: 'fc_pressure'},
                ],
                url: 'scripts/weatherDataList.php',
                async: false
            };

		    var dataAdapterList = new $.jqx.dataAdapter(sourceList,
			{
				autoBind: true,
				async: false,
				downloadComplete: function () { },
				loadComplete: function () { },
				loadError: function () { }
			});

            // ==================================================================================
		    // prepare temperature settings
			var tSettings = {
                title: '',
                description: '',
                showLegend: false,
                animationDuration: 500,
                showBorderLine: false,
			    source: dataAdapterList,
			    colorScheme: 'scheme05',
			    xAxis:
				{
				    textRotationAngle: 90,
                    valuesOnTicks: true,
                    dataField: 'timestamp',
				    type: 'date',
				    baseUnit: 'hour',
                    unitInterval: 2,
				    formatFunction: function (value) {
				        return $.jqx.dataFormat.formatdate(value, 'HH:mm');
				    },
				    showTickMarks: true
				},
                valueAxis:{
                    displayValueAxis: true,
                    description: '',
                    axisSize: 'auto',
                    unitInterval: 1,
                    labels: { visible: true, step: 5 },
                    tickMarks: { visible: true, step: 1, color: '#000000' },
                    gridLines: { visible: true, step: 5, color: '#000000' },
                    minValue: -10,
                    maxValue: 40
                },
			    seriesGroups:
				[
					{
					    type: 'line',
					    series: [
                            { dataField: 'temperature',
                              lineColor: '#000000',
                              emptyPointsDisplay: 'skip',
                              displayText: 'Gemessene Temperatur'
                            }
					    ]
					},
					{
					    type: 'scatter',
					    series: [
                            { dataField: 'fc_temperature',
                              symbolType: 'circle',
                              symbolSize: 1,
                              lineColor: '#a6a6a6',
                              emptyPointsDisplay: 'skip',
                              displayText: 'Vorhersage Temperatur'                           
                            }
					    ]
					}
				]
			};
			// setup the temperature chart
			$('#tempFunc').jqxChart(tSettings);

            // ==================================================================================
		    // prepare pressure settings
			var pSettings = {
                title: '',
                description: '',
                showLegend: false,
                animationDuration: 500,
                showBorderLine: false,
			    source: dataAdapterList,
			    colorScheme: 'scheme05',
			    xAxis:
				{
				    textRotationAngle: 90,
                    valuesOnTicks: true,
                    dataField: 'timestamp',
				    type: 'date',
				    baseUnit: 'hour',
                    unitInterval: 2,
				    formatFunction: function (value) {
				        return $.jqx.dataFormat.formatdate(value, 'HH:mm');
				    },
				    showTickMarks: true
				},
                valueAxis:{
                    displayValueAxis: true,
                    description: '',
                    axisSize: 'auto',
                    tickMarks: { visible: true, step: 1, color: '#000000' },
                    unitInterval: 5,
                    minValue: 950,
                    maxValue: 1080
                },
			    seriesGroups:
				[
					{
					    type: 'line',
					    series: [
                            { dataField: 'pressure',
                              lineColor: '#000000',
                              emptyPointsDisplay: 'skip',
                              displayText: 'Gemessener Luftdruck'
                            }
					    ]
					},
					{
					    type: 'scatter',
					    series: [
                            { dataField: 'fc_pressure',
                              symbolType: 'circle',
                              symbolSize: 1,
                              lineColor: '#a6a6a6',
                              emptyPointsDisplay: 'skip',
                              displayText: 'Vorhersage Luftdruck'                            
                            }
					    ]
					}
				]
			};
			// setup the pressure chart
			$('#presFunc').jqxChart(pSettings);

            // ==================================================================================
		    // prepare humidity settings
			var hSettings = {
                title: '',
                description: '',
                showLegend: false,
                animationDuration: 500,
                showBorderLine: false,
			    source: dataAdapterList,
			    colorScheme: 'scheme05',
			    xAxis:
				{
				    textRotationAngle: 90,
                    valuesOnTicks: true,
                    dataField: 'timestamp',
				    type: 'date',
				    baseUnit: 'hour',
                    unitInterval: 2,
				    formatFunction: function (value) {
				        return $.jqx.dataFormat.formatdate(value, 'HH:mm');
				    },
				    showTickMarks: true
				},
                valueAxis:{
                    displayValueAxis: true,
                    description: '',
                    axisSize: 'auto',
                    tickMarks: { visible: true, step: 1, color: '#000000' },
                    unitInterval: 10,
                    minValue: 0,
                    maxValue: 100
                },
			    seriesGroups:
				[
					{
					    type: 'line',
					    series: [
                            { dataField: 'humidity',
                              lineColor: '#000000',
                              emptyPointsDisplay: 'skip',
                              displayText: 'Gemessene Luftfeuchtigkeit'
                            }
					    ]
					},
					{
					    type: 'scatter',
					    series: [
                            { dataField: 'fc_humidity',
                              symbolType: 'circle',
                              symbolSize: 1,
                              lineColor: '#a6a6a6',
                              emptyPointsDisplay: 'skip',
                              displayText: 'Vorhersage Luftfeuchtigkeit'                            
                            }
					    ]
					}
				]
			};
			// setup the humidity chart
			$('#humiFunc').jqxChart(hSettings);

            // ==================================================================================
            // get hourly forecast data
            var sourceFcHour = {
                datatype: "json",
                datafields: [
                    { name: 'timestamp', type: 'date'},
                    { name: 'isday'},
                    { name: 'temperature'},
                    { name: 'humidity'},
                    { name: 'pressure'},
                    { name: 'clouds'},
                    { name: 'uvi'},
                    { name: 'visibility'},
                    { name: 'windspeed'},
                    { name: 'winddir'},
                    { name: 'rain'},
                    { name: 'snow'},
                    { name: 'description', type: 'string'},
                    { name: 'icon', type: 'string'},
                    { name: 'alerts', type: 'int'},
                ],
                url: 'scripts/weatherForecastHour.php',
                async: false
            };

		    var dataAdapterFcHour = new $.jqx.dataAdapter(sourceFcHour,
			{
				autoBind: true,
				async: false,
				downloadComplete: function () { },
				loadComplete: function () { },
				loadError: function () { }
			});

            // renderer for icons
            var iconrenderer = function(row, datafield, value) {
                return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/' + value + '.png"/>';
            }

            // renderer for alerts
            var alertrenderer = function(row, datafield, value) {
                if (value > 0){
                    return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/alert.png"/>';
                } else {
                    return '';
                }
            }

            // renderer for temperature
            var temprenderer = function(row, datafield, value) {
                return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                      + value.toLocaleString(undefined, 
                                            {
                                             minimumFractionDigits: 1, 
                                             maximumFractionDigits: 1,
                                            }) 
                      + ' °C</div>'
            }

            // renderer for rain/snow
            var poprenderer = function(row, datafield, value) {
                if (value > 0){
                    return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                        + value.toLocaleString(undefined, 
                                                {
                                                minimumFractionDigits: 2, 
                                                maximumFractionDigits: 2,
                                                }) 
                        + ' mm/h</div>'
                } else {
                    return ""
                }
            }

            // renderer for pressure
            var presrenderer = function(row, datafield, value) {
                return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                      + value.toLocaleString(undefined, 
                                            {
                                             minimumFractionDigits: 0, 
                                             maximumFractionDigits: 0,
                                            }) 
                      + ' hPa</div>'
            }

            // renderer for percentage
            var percrenderer = function(row, datafield, value) {
                if (value > 0){
                    return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                        + value.toLocaleString(undefined, 
                                                {
                                                minimumFractionDigits: 0, 
                                                maximumFractionDigits: 0,
                                                }) 
                        + ' %</div>'
                } else {
                    return ""
                }
            }

            // renderer for distance
            var distrenderer = function(row, datafield, value) {
                if (value > 0){
                    return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                        + value.toLocaleString(undefined, 
                                                {
                                                minimumFractionDigits: 0, 
                                                maximumFractionDigits: 0,
                                                }) 
                        + ' m</div>'
                } else {
                    return ""
                }
            }

            // renderer for UV index
            var uvrenderer = function(row, datafield, value) {
                if (value > 0){
                    return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                        + value.toLocaleString(undefined, 
                                                {
                                                minimumFractionDigits: 2, 
                                                maximumFractionDigits: 2,
                                                })
                        + '</div>'
                } else {
                    return ""
                }
            }

            // renderer for speed
            var speedrenderer = function(row, datafield, value) {
                if (value > 0){
                    return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                        + value.toLocaleString(undefined, 
                                                {
                                                minimumFractionDigits: 0, 
                                                maximumFractionDigits: 0,
                                                }) 
                        + ' m/s</div>'
                } else {
                    return ""
                }
            }

            // renderer for direction
            var dirrenderer = function(row, datafield, value) {
                if        (value > 338){
                    return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir180.png"/>';
                } else if (value > 292){
                    return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir135.png"/>';
                } else if (value > 248){
                    return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir090.png"/>';
                } else if (value > 202){
                    return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir045.png"/>';
                } else if (value > 158){
                    return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir000.png"/>';
                } else if (value > 113){
                    return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir315.png"/>';
                } else if (value > 68){
                    return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir270.png"/>';
                } else if (value > 22){
                    return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir225.png"/>';
                } else {
                    return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir180.png"/>';
                }
            }

            // class for temperature
            var tempclassname = function(row, column, value, data) {

                if (value > 40){
                    return 'snw-Temperature_p40'
                } else if (value > 30){
                    return 'snw-Temperature_p30'
                } else if (value > 20){
                    return 'snw-Temperature_p20'
                } else if (value > 10){
                    return 'snw-Temperature_p10'
                } else if (value > 5){
                    return 'snw-Temperature_p05'
                } else if (value > 0){
                    return 'snw-Temperature_p00'
                } else if (value > -5){
                    return 'snw-Temperature_m05'
                } else if (value > -10){
                    return 'snw-Temperature_m10'
                } else if (value > -20){
                    return 'snw-Temperature_m20'
                } else {
                    return 'snw-Temperature_m30'
                }
            }

            // class for day/night column
            var daynightclassname = function(row, column, value, data) {

                if (value == 1){
                    return 'snw-timeday'
                } else {
                    return 'snw-timenight'
                }
            }
            // renderer for day/night column
            var daynightrenderer = function(row, datafield, value) {
                return ""
            }

            // Grid localization
            var localizationobj = {};
            localizationobj.decimalseparator = ",";
            localizationobj.thousandsseparator = ".";
            var days = {
                // full day names
                names: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
                // abbreviated day names
                namesAbbr: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
                // shortest day names
                namesShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
            };
            localizationobj.days = days;
            var months = {
                // full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
                names: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember", ""],
                // abbreviated month names
                namesAbbr: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez", ""]
            };
            localizationobj.months = months

		    // prepare grid hourly forecast
			var fcHourSettings = {
                source: sourceFcHour,
                height: 915,
                width: 800,
                                
                columns: [
                    { 
                        text: 'Zeit', 
                        datafield: 'timestamp', 
                        cellsformat: 'ddd dd.MM HH:mm', 
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 115,
                        pinned: true,
                    },
                    { 
                        text: 'T', 
                        datafield: 'isday', 
                        cellsrenderer: daynightrenderer,
                        cellclassname: daynightclassname,
                        width: 5,
                        pinned: true,
                    },
                    { 
                        text: 'Icon', 
                        datafield: 'icon',
                        align: 'center', 
                        cellsalign: 'center', 
                        width: 55,
                        cellsrenderer: iconrenderer,
                    },
                    { 
                        text: 'Temp.', 
                        datafield: 'temperature', 
                        cellsformat: 'f1', 
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 62,
                        cellsrenderer: temprenderer,
                        cellclassname: tempclassname,
                    },
                    { 
                        text: 'Beschreibung', 
                        datafield: 'description',
                        align: 'left', 
                        cellsalign: 'left', 
                        width: 150,
                    },
                    { 
                        text: 'Alarme', 
                        datafield: 'alerts',
                        align: 'center', 
                        cellsalign: 'center', 
                        width: 55,
                        cellsrenderer: alertrenderer,
                    },
                    { 
                        text: 'Regen', 
                        datafield: 'rain',
                        cellsformat: 'f2', 
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 88,
                        cellsrenderer: poprenderer,
                    },
                    { 
                        text: 'Schnee', 
                        datafield: 'snow',
                        align: 'right', 
                        cellsformat: 'f2', 
                        cellsalign: 'right', 
                        width: 88,
                        cellsrenderer: poprenderer,
                    },
                    { 
                        text: 'Luftdruck', 
                        datafield: 'pressure',
                        cellsformat: 'f', 
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 77,
                        cellsrenderer: presrenderer,
                    },
                    { 
                        text: 'Luftfcht.', 
                        datafield: 'humidity',
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 67,
                        cellsrenderer: percrenderer,
                    },
                    { 
                        text: 'Wolken', 
                        datafield: 'clouds',
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 60,
                        cellsrenderer: percrenderer,
                    },
                    { 
                        text: 'UV Index', 
                        datafield: 'uvi',
                        cellsformat: 'f2', 
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 70,
                        cellsrenderer: uvrenderer,
                    },
                    { 
                        text: 'Sichtweite', 
                        datafield: 'visibility',
                        cellsformat: 'n', 
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 85,
                        cellsrenderer: distrenderer,
                    },
                    { 
                        text: 'Windgeschw.', 
                        datafield: 'windspeed',
                        cellsformat: 'f1', 
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 95,
                        cellsrenderer: speedrenderer,
                    },
                    { 
                        text: 'Windrichtung', 
                        datafield: 'winddir',
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 95,
                        cellsrenderer: dirrenderer,
                    },
                ]
             }

			// setup the hourly forecast table
            $("#forecastHourlyTab").jqxGrid(fcHourSettings);
            $("#forecastHourlyTab").jqxGrid('localizestrings', localizationobj);

            // ==================================================================================
            // get alert data
            var sourceFcAlerts = {
                datatype: "json",
                datafields: [
                    { name: 'start',        type: 'date'},
                    { name: 'end',          type: 'date'},
                    { name: 'event',        type: 'string'},
                    { name: 'sender_name',  type: 'string'},
                    { name: 'description',  type: 'string'},
                ],
                url: 'scripts/weatherForecastAlerts.php',
                async: false
            };

            var dataAdapterFcAlerts = new $.jqx.dataAdapter(sourceFcAlerts,
			{
				autoBind: true,
				async: false,
				downloadComplete: function () { },
				loadComplete: function () { },
				loadError: function () { }
			});

		    // prepare grid alerts
			var fcAlertsSettings = {
                source: sourceFcAlerts,
                width: 800,
                autorowheight: true,
                autoheight: true,

                columns: [
                    { 
                        text: 'Beginn', 
                        datafield: 'start', 
                        cellsformat: 'ddd dd.MM HH:mm', 
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 120,
                    },
                    { 
                        text: 'Ende', 
                        datafield: 'end', 
                        cellsformat: 'ddd dd.MM HH:mm', 
                        align: 'right', 
                        cellsalign: 'right', 
                        width: 120,
                    },
                    { 
                        text: 'Ereignis', 
                        datafield: 'event', 
                        width: 140,
                    },
                    { 
                        text: 'Beschreibung', 
                        datafield: 'description', 
                        width: 400,
                    },
                ]
             }

			// setup the alert table
            $("#forecastAlertsTab").jqxGrid(fcAlertsSettings);
            $("#forecastAlertsTab").jqxGrid('localizestrings', localizationobj);

            // ==================================================================================
            // get daily forecast data
            var sourceFcDay = {
                datatype: "json",
                datafields: [
                    { name: 'property'},
                    { name: 'day_01'},
                    { name: 'day_02'},
                    { name: 'day_03'},
                    { name: 'day_04'},
                    { name: 'day_05'},
                    { name: 'day_06'},
                    { name: 'day_07'},
                    { name: 'day_08'},
                ],
                url: 'scripts/weatherForecastDay.php',
                async: false
            };

            var dataAdapterFcDay = new $.jqx.dataAdapter(sourceFcDay,
			{
				autoBind: true,
				async: false,
				downloadComplete: function () { },
				loadComplete: function () { },
				loadError: function () { }
			});

            // renderer for property
            var propertyrenderer = function(row, datafield, value) {
                switch (row){
                    case 0 : return '<div style="margin-top: 8px; margin-left: 2px;">Datum</div>';
                    case 1 : return '<div style="margin-top: 8px; margin-left: 2px;">Sonnenaufgang</div>';
                    case 2 : return '<div style="margin-top: 8px; margin-left: 2px;">Sonnenuntergang</div>';
                    case 3 : return '<div style="margin-top: 8px; margin-left: 2px;">Temp.: Morgen</div>';
                    case 4 : return '<div style="margin-top: 8px; margin-left: 2px;">Temp.: Tag</div>';
                    case 5 : return '<div style="margin-top: 8px; margin-left: 2px;">Temp.: Abend</div>';
                    case 6 : return '<div style="margin-top: 8px; margin-left: 2px;">Temp.: Nacht</div>';
                    case 7 : return '<div style="margin-top: 8px; margin-left: 2px;">Temp.: Minimum</div>';
                    case 8 : return '<div style="margin-top: 8px; margin-left: 2px;">Temp.: Maximum</div>';
                    case 9 : return '<div style="margin-top: 8px; margin-left: 2px;">Luftdruck</div>';
                    case 10: return '<div style="margin-top: 8px; margin-left: 2px;">Luftfeuchtigkeit</div>';
                    case 11: return '<div style="margin-top: 8px; margin-left: 2px;">Windgeschwind.</div>';
                    case 12: return '<div style="margin-top: 8px; margin-left: 2px;">Windrichtung</div>';
                    case 13: return '<div style="margin-top: 8px; margin-left: 2px;">Wolken</div>';
                    case 14: return '<div style="margin-top: 8px; margin-left: 2px;">UV Index</div>';
                    case 15: return '<div style="margin-top: 8px; margin-left: 2px;">Niederschl. Wahrs.</div>';
                    case 16: return '<div style="margin-top: 8px; margin-left: 2px;">Regen</div>';
                    case 17: return '<div style="margin-top: 8px; margin-left: 2px;">Schnee</div>';
                    case 18: return '<div style="margin-top: 8px; margin-left: 2px;">Beschreibung</div>';
                    case 19: return '<div style="margin-top: 8px; margin-left: 2px;">Icon</div>';
                    case 20: return '<div style="margin-top: 8px; margin-left: 2px;">Alarme</div>';
                }
            }

            var dvalrenderer = function(row, datafield, value) {
                switch (row){
                    case 0 :
                        var val = new Date(value);
                        var wdn = val.getDay();
                        var wds = days['namesAbbr'][wdn];
                        var ds  = val.getDate().toString().padStart(2, '0');
                        var mn  = val.getMonth() + 1;
                        var ms  = mn.toString().padStart(2, '0')
                        return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                        + wds + ' ' + ds + '.' + ms + '.'
                        + '</div>';
                    case 1 : 
                    case 2 : 
                        return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                        + value
                        + '</div>';
                    case 3 :
                    case 4 : 
                    case 5 : 
                    case 6 : 
                    case 7 : 
                    case 8 : 
                        return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                                + value.toLocaleString(undefined, 
                                                        {
                                                        minimumFractionDigits: 1, 
                                                        maximumFractionDigits: 1,
                                                        }) 
                                + ' °C</div>';
                    case 9 : 
                        return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                                + value.toLocaleString(undefined, 
                                                        {
                                                        minimumFractionDigits: 0, 
                                                        maximumFractionDigits: 0,
                                                        }) 
                                + ' hPa</div>';
                    case 10: 
                    case 13: 
                        if (value > 0){
                            return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                                + value.toLocaleString(undefined, 
                                                        {
                                                        minimumFractionDigits: 0, 
                                                        maximumFractionDigits: 0,
                                                        }) 
                                + ' %</div>';
                        } else {
                            return "";
                        }
                    case 11: 
                        if (value > 0){
                            return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                                + value.toLocaleString(undefined, 
                                                        {
                                                        minimumFractionDigits: 0, 
                                                        maximumFractionDigits: 0,
                                                        }) 
                                + ' m/s</div>';
                        } else {
                            return "";
                        }
                    case 12: 
                        if        (value > 338){
                            return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir180.png"/>';
                        } else if (value > 292){
                            return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir135.png"/>';
                        } else if (value > 248){
                            return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir090.png"/>';
                        } else if (value > 202){
                            return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir045.png"/>';
                        } else if (value > 158){
                            return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir000.png"/>';
                        } else if (value > 113){
                            return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir315.png"/>';
                        } else if (value > 68){
                            return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir270.png"/>';
                        } else if (value > 22){
                            return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir225.png"/>';
                        } else {
                            return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/dir180.png"/>';
                        }
                    case 14: 
                        if (value > 0){
                            return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                                + value.toLocaleString(undefined, 
                                                        {
                                                        minimumFractionDigits: 2, 
                                                        maximumFractionDigits: 2,
                                                        })
                                + '</div>';
                        } else {
                            return "";
                        }
                    case 15: 
                        if (value > 0){
                            val = 100 * value
                            return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                                + val.toLocaleString(undefined, 
                                                        {
                                                        minimumFractionDigits: 0, 
                                                        maximumFractionDigits: 0,
                                                        }) 
                                + ' %</div>';
                        } else {
                            return "";
                        }
                    case 16: 
                    case 17: 
                        if (value > 0){
                            return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                                + value.toLocaleString(undefined, 
                                                        {
                                                        minimumFractionDigits: 2, 
                                                        maximumFractionDigits: 2,
                                                        }) 
                                + ' mm/h</div>';
                        } else {
                            return "";
                        }
                    case 18: 
                        return '<div class="jqx-grid-cell-left-align" style="margin-top: 8px;">' 
                                + value
                                + '</div>';
                    case 19: 
                        return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/' + value + '.png"/>';
                    case 20: 
                        if (value > 0){
                            return '<img style="margin-top: 4px; margin-bottom: auto; margin-left: auto; margin-right: auto; display: block;" src="./icons/alert.png"/>';
                        } else {
                            return '';
                        }
                }
            }

		    // prepare grid daily forecast
			var fcDaySettings = {
                source: sourceFcDay,
                width: 800,
                autoheight: true,
                autorowheight: true,
                showheader: false,
                
                columns: [
                    { 
                        text: 'Eigenschaft', 
                        datafield: 'property', 
                        width: 120,
                        pinned: true,
                        cellsrenderer: propertyrenderer,
                    },
                    { 
                        text: 'Tag 1', 
                        datafield: 'day_01', 
                        width: 85,
                        cellsalign: 'right', 
                        cellsrenderer: dvalrenderer,
                    },
                    { 
                        text: 'Tag 2', 
                        datafield: 'day_02', 
                        width: 85,
                        cellsalign: 'right', 
                        cellsrenderer: dvalrenderer,
                    },
                    { 
                        text: 'Tag 3', 
                        datafield: 'day_03', 
                        width: 85,
                        cellsalign: 'right', 
                        cellsrenderer: dvalrenderer,
                    },
                    { 
                        text: 'Tag 4', 
                        datafield: 'day_04', 
                        width: 85,
                        cellsalign: 'right', 
                        cellsrenderer: dvalrenderer,
                    },
                    { 
                        text: 'Tag 5', 
                        datafield: 'day_05', 
                        width: 85,
                        cellsalign: 'right', 
                        cellsrenderer: dvalrenderer,
                    },
                    { 
                        text: 'Tag 6', 
                        datafield: 'day_06', 
                        width: 85,
                        cellsalign: 'right', 
                        cellsrenderer: dvalrenderer,
                    },
                    { 
                        text: 'Tag 7', 
                        datafield: 'day_07', 
                        width: 85,
                        cellsalign: 'right', 
                        cellsrenderer: dvalrenderer,
                    },
                    { 
                        text: 'Tag 8', 
                        datafield: 'day_08', 
                        width: 85,
                        cellsalign: 'right', 
                        cellsrenderer: dvalrenderer,
                    },
                ]
             }

			// setup the hourly forecast table
            $("#forecastDailyTab").jqxGrid(fcDaySettings);
            $("#forecastDailyTab").jqxGrid('localizestrings', localizationobj);

        });
    </script>
</head>
<body>
<header>
	<div class="snw-flex-container snw-header">
        <!-- Header -->
		<div class="snw-flex-item snw-station">
			<h1>Wetterstation</h1>
		</div>
		<div class="snw-flex-item snw-time">
			<p id="measurement"></p>
		</div>
		<div class="snw-flex-item snw-nav">
			<p>Navigation</p>
		</div>
	</div>
</header>
<main>
	<div class="snw-flex-container">
        <!-- Main data area -->
		<div class="snw-flex-item current">
            <!-- Current measurements -->
			<div class="snw-flex-item snw-temp-block">
                <!-- Temperature block -->
                <div class="snw-flex-container">
					<div class="snw-flex-item">
                        <div class="snw-thermometer" id="thermometer"></div>
                        <p class="snw-value" id="tempCur"></p>
					</div>
					<div class="snw-flex-item">
                        <div class="snw-cur-graph" id="tempFunc"></div>
					</div>
				</div>
			</div>
			<div class="snw-flex-item snw-pres-block">
                <!-- Pressure block -->
				<div class="snw-flex-container">
					<div class="snw-flex-item">
                        <div class="snw-gauge" id="barometer"></div>
                        <p class="snw-value" id="presCur"></p>
					</div>
					<div class="snw-flex-item">
                        <div class="snw-cur-graph" id="presFunc"></div>
					</div>
				</div>
			</div>
			<div class="snw-flex-item snw-humi-block">
                <!-- Humidity block -->
				<div class="snw-flex-container">
					<div class="snw-flex-item">
                        <div class="snw-gauge" id="hygrometer"></div>
                        <p class="snw-value" id="humiCur"></p>
					</div>
					<div class="snw-flex-item">
                        <div class="snw-cur-graph" id="humiFunc"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="snw-flex-item hour-forecast">
            <!-- Hourly forecast and alerts -->
			<div class="snw-flex-container-column">
				<div class="snw-flex-item">
                    <div class="snw-fchour-grid" id="forecastHourlyTab"></div>
				</div>
				<div class="snw-flex-item">
                    <div class="snw-fcalerts-grid" id="forecastAlertsTab"></div>
				</div>
			</div>
		</div>
		<div class="snw-flex-item day-forecast">
            <!-- Daily forecast -->
			<div class="snw-flex-container-column">
				<div class="snw-flex-item">
                    <div class="snw-fcday-grid" id="forecastDailyTab"></div>
				</div>
			</div>
		</div>
	</div>
</main>
<footer>
	<div class="snw-flex-container">
		<div class="snw-flex-item">
			<p></p>
		</div>
	</div>
</footer>
</body>
</html>