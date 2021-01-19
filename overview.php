<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=0.2" />	
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
    <script type="text/javascript" src="scripts/jqwidgets/jqxdatetimeinput.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/jqxcalendar.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/globalization/globalize.js"></script>
    <script type="text/javascript" src="scripts/jqwidgets/globalization/globalize.culture.de-DE.js"></script>

    <script type="text/javascript">
        $(document).ready(function () {

            // ==================================================================================
            Date.prototype.toDayTimestamp = function() {
                y = this.getFullYear();
                m = this.getMonth() + 1;
                d = this.getDate();
                ts = y 
                    + '-' + m.toString().padStart(2, '0') 
                    + '-' + d.toString().padStart(2, '0');
                return ts;
            };

            // Specify data
            var tEnd   = new Date();
            var tStart = new Date(tEnd.getFullYear(), tEnd.getMonth(), 1)
            var querydata = {
                'start' : tStart.toDayTimestamp() + ' 00:00:00',
                'end'   : tEnd.toDayTimestamp() + ' 23:59:59',
            };
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
                url: 'scripts/weatherOverviewList.php',
                data: querydata,
                async: false,
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
				    baseUnit: 'day',
                    unitInterval: 1,
				    formatFunction: function (value) {
				        return $.jqx.dataFormat.formatdate(value, 'dd.MM.yy');
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
				    baseUnit: 'day',
                    unitInterval: 1,
				    formatFunction: function (value) {
				        return $.jqx.dataFormat.formatdate(value, 'dd.MM.yy');
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
				    baseUnit: 'day',
                    unitInterval: 1,
				    formatFunction: function (value) {
				        return $.jqx.dataFormat.formatdate(value, 'dd.MM.yy');
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
        
            // Setup start selector
            $("#startinput").jqxDateTimeInput({ width: '120px', height: '25px' });
            $('#startinput').jqxDateTimeInput({culture: 'de-DE' });
            $("#startinput").jqxDateTimeInput('setDate', tStart);
            $('#startinput').on('change', function (event) {  
                tStart = event.args.date;
                querydata = {
                    'start' : tStart.toDayTimestamp() + ' 00:00:00',
                    'end'   : tEnd.toDayTimestamp() + ' 23:59:59',
                };
                sourceList['data'] = querydata;
                dataAdapterList.dataBind();
                $('#tempFunc').jqxChart('refresh');
                $('#presFunc').jqxChart('refresh');
                $('#humiFunc').jqxChart('refresh');
            });
            // Setup end selector
            $("#endinput").jqxDateTimeInput({ width: '120px', height: '25px' });
            $('#endinput').jqxDateTimeInput({culture: 'de-DE' });
            $("#endinput").jqxDateTimeInput('setDate', tEnd);
            $('#endinput').on('change', function (event) {  
                tEnd = event.args.date;
                querydata = {
                    'start' : tStart.toDayTimestamp() + ' 00:00:00',
                    'end'   : tEnd.toDayTimestamp() + ' 23:59:59',
                };
                sourceList['data'] = querydata;
                dataAdapterList.dataBind();
                $('#tempFunc').jqxChart('refresh');
                $('#presFunc').jqxChart('refresh');
                $('#humiFunc').jqxChart('refresh');
            });
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
		<div class="snw-flex-item snw-nav">
            <p>Von: </p><div id='startinput'></div>
		</div>
		<div class="snw-flex-item snw-nav">
            <p>Bis: </p><div id='endinput'></div>
		</div>
	</div>
</header>
<main>
	<div class="snw-flex-container-column">
        <div class="snw-flex-item">
            <div class="snw-ovw-graph" id="tempFunc"></div>
	    </div>
        <div class="snw-flex-item">
            <div class="snw-ovw-graph" id="presFunc"></div>
	    </div>
        <div class="snw-flex-item">
            <div class="snw-ovw-graph" id="humiFunc"></div>
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