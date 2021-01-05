<!DOCTYPE html>
<html lang="en">
<head>
    <title id='Description'>Weatherstation</title>
    <link rel="stylesheet" href="styles/jqx.base.css" type="text/css" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width, initial-scale=1 maximum-scale=1 minimum-scale=1" />	
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
    <script type="text/javascript">
        $(document).ready(function () {
            // Set up thermometer
            $('#thermometer').jqxLinearGauge({
                orientation: 'vertical',
                width: 200,
                height: 400,
                ticksMajor: { size: '15%', interval: 5 },
                ticksMinor: { size: '8%', interval: 1, style: { 'stroke-width': 1, stroke: '#aaaaaa'} },
                max: 40,
                min: -30,
                pointer: { size: '5%' },
                colorScheme: 'scheme05',
                labels: { interval: 10, formatValue: function (value, position) {
                    return value + '°C';
                }
                },
                animationDuration: 500
            });

            // Set up barometer
            $('#barometer').jqxGauge({
                width: 350,
                height: 350,
                radius: 160,
                startAngle: 60,
                endAngle: 360,
                ticksMajor: { size: '10%', interval: 10, style: { stroke: '#898989'}, visible: true },
                ticksMinor: { size: '6%', interval: 1, style: { stroke: '#898989'}, visible: true },
                max: 1080,
                min: 950,
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

            // Set up hygrometer
            $('#hygrometer').jqxGauge({
                width: 350,
                height: 350,
                radius: 160,
                startAngle: 50,
                endAngle: 330,
                ticksMajor: { size: '10%', interval: 10, style: { stroke: '#898989'}, visible: true },
                ticksMinor: { size: '6%', interval: 1, style: { stroke: '#898989'}, visible: true },
                max: 100,
                min: 0,
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
                url: 'src/weatherDataRange.php'
            };

            // Update thermometer, barometer and hygrometer with measurement data
		    var dataAdapterRange = new $.jqx.dataAdapter(sourceRange, {
                loadComplete: function() {
                    var records = dataAdapterRange.records;
                    var length = records.length;
                    if (length > 0) {
                        var record = records[0];

                        // Update measurement time
                        document.getElementById("measurement").innerHTML
                            = record.curTimestamp.toLocaleDateString('de-DE') + " " 
                            + record.curTimestamp.toLocaleTimeString('de-DE') + "<br>"
                            + record.staTimestamp.toLocaleDateString('de-DE') + " "
                            + record.staTimestamp.toLocaleTimeString('de-DE') + " "

                        // Update thermometer
                        var tRanges = [{
                            startValue: record.temperatureMin,
                            endValue: record.temperatureMax,
                            style: {
                                fill: '#000000',
                                stroke: '#000000'
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
                            {startValue: record.pressureMin, endValue: record.pressureMax, style: {fill: '#f000000', stroke: '#000000'}, startDistance: 22, endDistance: 22}
                        ];
                        $('#barometer').jqxGauge({ ranges: bRanges });
                        $('#barometer').jqxGauge('value', record.pressureCur);
                        document.getElementById("presCur").innerHTML = record.pressureCur + " hPa"

                        // Update hygrometer
                        var hRanges = [
                            {startValue: 0, endValue: 35, style: {fill: '#ff4000', stroke: '#000000'}},
                            {startValue: 35, endValue: 65, style: {fill: '#40ff00', stroke: '#000000'}},
                            {startValue: 65, endValue: 100, style: {fill: '#0000ff', stroke: '#000000'}},
                            {startValue: record.humidityMin, endValue: record.humidityMax, style: {fill: '#f000000', stroke: '#000000'}, startDistance: 22, endDistance: 22}
                        ];
                        $('#hygrometer').jqxGauge({ ranges: hRanges });
                        $('#hygrometer').jqxGauge('value', record.humidityCur);
                        document.getElementById("humiCur").innerHTML = record.humidityCur + " %"
                    }
                }
            });

            // Get data from data source for range date
            dataAdapterRange.dataBind();

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
                ],
                url: 'src/weatherDataList.php',
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
				        return $.jqx.dataFormat.formatdate(value, 'dd.MM. HH:mm');
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
                            { dataField: 'temperature'}
					    ]
					}
				]
			};
			// setup the temperature chart
			$('#tempFunc').jqxChart(tSettings);

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
				        return $.jqx.dataFormat.formatdate(value, 'dd.MM. HH:mm');
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
                            { dataField: 'pressure'}
					    ]
					}
				]
			};
			// setup the temperature chart
			$('#presFunc').jqxChart(pSettings);

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
				        return $.jqx.dataFormat.formatdate(value, 'dd.MM. HH:mm');
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
                            { dataField: 'humidity'}
					    ]
					}
				]
			};
			// setup the temperature chart
			$('#humiFunc').jqxChart(hSettings);

        });
    </script>
	<style type="text/css">
        .auto-style1 {
            font-family: Arial, Helvetica, sans-serif;
        }
	</style>
</head>
<body class='default'>
<h1 class="auto-style1">Wetterstation</h1>

<table style="width: 100%">
	<tr>
		<td style="width: 13%">
		<p><span lang="de"><span class="auto-style1">
		Messung am:<br>Daten ab:</span></span></p></td>
		<td style="width: 17%"><span lang="de"><span class="auto-style1">
		<p id="measurement"></p></span></span></td>
		<td style="width: 30%">&nbsp;</td>
		<td style="width: 30%">&nbsp;</td>
	</tr>
	<tr>
		<td class="jqx-knob" colspan="2">
		<span class="auto-style1" lang="de"><strong>Temperatur</strong></span></td>
		<td class="jqx-knob" style="width: 30%">
		<span class="auto-style1" lang="de"><strong>Luftdruck</strong></span></td>
		<td class="jqx-knob"><span class="auto-style1" lang="de"><strong>
		Luftfeuchtigkeit</strong></span></td>
	</tr>
	<tr>
		<td colspan="2"><div style="margin: auto" id="thermometer"></div></td>
		<td style="width: 30%"><div style="margin: auto" id="barometer"></div></td>
		<td style="width: 30%"><div style="margin: auto" id="hygrometer"></div></td>
	</tr>
	<tr>
		<td class="jqx-knob" colspan="2">
		<span class="auto-style1" lang="de"><p id="tempCur"></p></span></td>
		<td style="width: 30%" class="jqx-knob">
        <span class="auto-style1" lang="de"><p id="presCur"></p></span></td>
		<td style="width: 30%" class="jqx-knob">
        <span class="auto-style1" lang="de"><p id="humiCur"></p></span></td>
	</tr>
	<tr>
		<td colspan="2"><div style="width:310px; height:400px; margin: auto" id="tempFunc"></div></td>
		<td style="width: 30%"><div style="width:310px; height:400px; margin: auto" id="presFunc"></div></td>
		<td style="width: 30%"><div style="width:310px; height:400px; margin: auto" id="humiFunc"></div></td>
	</tr>
</table>

</body>
</html>