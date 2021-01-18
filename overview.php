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

    <script type="text/javascript">
        $(document).ready(function () {

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
                url: 'scripts/weatherOverviewList.php',
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
        
            // Setup refresh button
            $("#refreshbutton").jqxButton({ width: '150', height: '50'});
            $('#refreshbutton').click(function() {
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
            <input type="button" value="Aktualisieren" id='refreshbutton' />
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