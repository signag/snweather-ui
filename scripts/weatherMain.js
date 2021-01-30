// ===============
// Global settings
// ===============
//
// Path to i18n lacale JSON files relative to root
var localesPath     = "/locales";
// Supported languages
var supportedLangs = ["de", "en"];
// Fallback language
var fallbackLangs   = ["de"];
//
// ================
// Global variables
// ================
var dataAdapterRange;
var dataAdapterList;
var dataAdapterFcHour
var dataAdapterFcAlerts;
var dataAdapterFcDay;
var sourceRange;
var sourceFcHour;
var sourceFcAlerts;
var sourceFcDay;
var iconrenderer;
var alertrenderer;
var temprenderer;
var poprenderer;
var presrenderer;
var percrenderer;
var percrenderer;
var distrenderer;
var distrenderer;
var uvrenderer;
var speedrenderer
var dirrenderer;
var daynightrenderer;
var propertyrenderer;
var dvalrenderer;
var tempclassname;
var daynightclassname;
var dvalclassname;
var localizationobj;
var days;
var months;

/*
=======================
Localization
======================= */
function localize() {
    // Localize header
    $('.snw-header').localize();

    // Localize hourly forecast grid
    defineGridLocalization();
    $("#forecastHourlyTab").jqxGrid('localizestrings', localizationobj);
    setupHourlyForecastGrid();

    // TODO: localization of other grids
}

/*
================================================================
Get list of supported languages
================================================================ */
function getLngList() {
    var lngList = [];
    // Get list of supported languages from i18next
    // var lngs = i18next.languages;
    var lngs = supportedLangs;

    for (var i=0; i < lngs.length; i++) {
        lngList.push(lngs[i]);
    };

    return lngList;
}

/*
================================================================
Get index of active language in language selection dropdown list
================================================================ */
function getLngIndex(lngs) {
    var ind = 1;

    // Get current language from i18next
    var lng =i18next.language;

    for (var i=0; i < lngs.length; i++) {
        if (lng == lngs[i]) {
            ind = i;
            break;
        };
    };

    return ind;
}

/*
===================
Set up Thermometer
=================== */
function setupThermometer() {
    // Set up thermometer widget base configuration
    $('#thermometer').jqxLinearGauge({
        orientation: 'vertical',
        width:  200,
        height: 316,
        ticksMajor: { 
            size:     '15%', 
            interval: 5,
        },
        ticksMinor: { 
            size: '8%', 
            interval: 1, 
            style: { 
                stroke: '#aaaaaa'
            },
        },
        max:  40,
        min: -30,
        pointer: { 
            size:  '5%',
            style: {
                fill: '#000000',
            },
        },
        colorScheme: 'scheme05',
        labels: { 
            interval: 10, 
            formatValue: function (value, position) {
                return value + '°C';
            },
        },
        animationDuration: 500,
    });
}
/*
===================
Set up Barometer
=================== */
function setupBarometer() {
    // Set up thermometer widget base configuration
    $('#barometer').jqxGauge({
        width:  316,
        height: 316,
        radius: 160,
        startAngle: 60,
        endAngle:  360,
        ticksMajor: { 
            size:    '10%', 
            interval: 10, 
            style: { 
                stroke: '#898989',
            }, 
            visible: true,
        },
        ticksMinor: { 
            size:    '6%', 
            interval: 1, 
            style: { 
                stroke: '#898989',
            }, 
            visible: true 
        },
        max: 1080,
        min:  950,
        pointer: { 
            style: {
                fill:  '#000000',
            }
        },
        labels: { 
            position: 'inside', 
            interval: 10,
        },
        colorScheme: 'scheme05',
        caption: { 
            value:    'hPa', 
            position: 'bottom', 
            offset:   [0, 30], 
            visible:  true,
        },
        animationDuration: 500,
    });
    // Specify colored ranges
    var bRanges = [
        {startValue:  950, endValue:  990, style: {fill: '#0000ff', stroke: '#000000'}},
        {startValue:  990, endValue: 1040, style: {fill: '#ffff00', stroke: '#000000'}},
        {startValue: 1040, endValue: 1080, style: {fill: '#ff4000', stroke: '#000000'}},
    ];
    $('#barometer').jqxGauge({ ranges: bRanges });
}
/*
===================
Set up hyprometer
=================== */
function setupHygrometer() {
    // Set up hygrometer widget base configuration
    $('#hygrometer').jqxGauge({
        width:  316,
        height: 316,
        radius: 160,
        startAngle: 50,
        endAngle:  330,
        ticksMajor: { 
            size:    '10%', 
            interval: 10, 
            style: { 
                stroke: '#898989',
            }, 
            visible: true,
        },
        ticksMinor: { 
            size:    '6%', 
            interval: 1, 
            style: { 
                stroke: '#898989',
            }, 
            visible: true,
        },
        max: 100,
        min: 0,
        pointer: { 
            size: '5%',
            style: {
                fill: '#000000',
            },
        },
        labels: { 
            position: 'inside', 
            interval: 10,
        },
        colorScheme: 'scheme05',
        caption: { 
            value:    '%', 
            position: 'bottom', 
            offset:   [0, 30], 
            visible:  true,
        },
        animationDuration: 500,
    });
    // Specify colored ranges
    var hRanges = [
        {startValue:  0, endValue:  35, style: {fill: '#ff4000', stroke: '#000000'}},
        {startValue: 35, endValue:  65, style: {fill: '#40ff00', stroke: '#000000'}},
        {startValue: 65, endValue: 100, style: {fill: '#0000ff', stroke: '#000000'}}
    ];
    $('#hygrometer').jqxGauge({ ranges: hRanges });
}
/*
=============================================================
Set up data adapter for thermometer, barometer and hygrometer

All widgets get their data from the same data adapter
Widgets ara updated once data loading is completed
============================================================= */
function setupDataAdapterRange() {
    // Specify data source
    sourceRange = {
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
        url: 'scripts/weatherDataRange.php',
    };
    // Set up data adapter
    dataAdapterRange = new $.jqx.dataAdapter(sourceRange, {
        loadComplete: function() {
            // On load completion, update related chart data
            var records = dataAdapterRange.records;
            var length  = records.length;
            if (length > 0) {
                var record = records[0];

                // Update measurement time
                document.getElementById("measurement").innerHTML
                    = "Messwerte vom "
                    + record.curTimestamp.toLocaleDateString('de-DE') + " um " 
                    + record.curTimestamp.toLocaleTimeString('de-DE') + " Uhr";

                // Update thermometer
                var tRanges = [{
                    startValue: record.temperatureMin,
                    endValue:   record.temperatureMax,
                    style: {
                        fill:   '#999999',
                        stroke: '#999999',
                    },
                }];
                $('#thermometer').jqxLinearGauge({ ranges: tRanges });
                $('#thermometer').jqxLinearGauge('value', record.temperatureCur);

                document.getElementById("tempCur").innerHTML = record.temperatureCur + " °C"

                // Update barometer
                var bRanges = [
                    {startValue:  950, endValue:  990, style: {fill: '#0000ff', stroke: '#000000'}},
                    {startValue:  990, endValue: 1040, style: {fill: '#ffff00', stroke: '#000000'}},
                    {startValue: 1040, endValue: 1080, style: {fill: '#ff4000', stroke: '#000000'}},
                    {
                        startValue: record.pressureMin, 
                        endValue: record.pressureMax, 
                        style: {
                            fill:   '#999999', 
                            stroke: '#999999',
                        }, 
                        startDistance: 22, 
                        endDistance:   22,
                    },
                ];
                $('#barometer').jqxGauge({ ranges: bRanges });
                $('#barometer').jqxGauge('value', record.pressureCur);

                document.getElementById('presCur').innerHTML = record.pressureCur + " hPa"

                // Update hygrometer
                var hRanges = [
                    {startValue: 0, endValue:   35, style: {fill: '#ff4000', stroke: '#000000'}},
                    {startValue: 35, endValue:  65, style: {fill: '#40ff00', stroke: '#000000'}},
                    {startValue: 65, endValue: 100, style: {fill: '#0000ff', stroke: '#000000'}},
                    {
                        startValue: record.humidityMin, 
                        endValue: record.humidityMax, 
                        style: {
                            fill:   '#999999', 
                            stroke: '#999999',
                        }, 
                        startDistance: 22, 
                        endDistance:   22,
                    },
                ];
                $('#hygrometer').jqxGauge({ ranges: hRanges });
                $('#hygrometer').jqxGauge('value', record.humidityCur);

                document.getElementById("humiCur").innerHTML = record.humidityCur + " %"
            };
        }
    });

    // Get data from data source for range date
    dataAdapterRange.dataBind();
}
/*
===================================================================
Set up data adapter for temperature, pressure and humidity diagrams
=================================================================== */
function setupDataAdapterList() {
    // Specify list data
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
        async: false,
    };

    dataAdapterList = new $.jqx.dataAdapter(sourceList,
    {
        autoBind: true,
        async:    false,
        downloadComplete: function () { },
        loadComplete:     function () { },
        loadError:        function () { },
    });
}
/*
========================
Set up temperature chart
======================== */
function setupTemperatureDiagram() {
    // ==================================================================================
    // Specify settings
    var tSettings = {
        title:             '',
        description:       '',
        showLegend:        false,
        animationDuration: 500,
        showBorderLine:    false,
        source:            dataAdapterList,
        colorScheme:       'scheme05',
        xAxis:
        {
            textRotationAngle: 90,
            valuesOnTicks:     true,
            dataField:        'timestamp',
            type:             'date',
            baseUnit:         'hour',
            unitInterval:     2,
            formatFunction: function (value) {
                return $.jqx.dataFormat.formatdate(value, 'HH:mm');
            },
            showTickMarks: true,
        },
        valueAxis:{
            displayValueAxis: true,
            description:      '',
            axisSize:         'auto',
            unitInterval:     1,
            labels: { 
                visible: true, 
                step: 5,
            },
            tickMarks: { 
                visible: true, 
                step:    1, 
                color:  '#000000', 
            },
            gridLines: { 
                visible: true, 
                step:    5, 
                color:  '#000000',
            },
            minValue: -10,
            maxValue:  40,
        },
        seriesGroups: [
            {
                type:   'line',
                series: [
                    { dataField:          'temperature',
                      lineColor:          '#000000',
                      emptyPointsDisplay: 'skip',
                      displayText:        'Gemessene Temperatur',
                    }
                ]
            },
            {
                type: 'scatter',
                series: [
                    { dataField:          'fc_temperature',
                      symbolType:         'circle',
                      symbolSize:         1,
                      lineColor:          '#a6a6a6',
                      emptyPointsDisplay: 'skip',
                      displayText:        'Vorhersage Temperatur',                         
                    },
                ],
            },
        ],
    };
    // Draw chart
    $('#tempFunc').jqxChart(tSettings);
}
/*
=====================
Set up pressure chart
===================== */
function setupPressureDiagram() {

    // ==================================================================================
    // prepare pressure settings
    var pSettings = {
        title:             '',
        description:       '',
        showLegend:        false,
        animationDuration: 500,
        showBorderLine:    false,
        source:            dataAdapterList,
        colorScheme:       'scheme05',
        xAxis:
        {
            textRotationAngle: 90,
            valuesOnTicks:     true,
            dataField:         'timestamp',
            type:              'date',
            baseUnit:          'hour',
            unitInterval:      2,
            formatFunction: function (value) {
                return $.jqx.dataFormat.formatdate(value, 'HH:mm');
            },
            showTickMarks:     true,
        },
        valueAxis:{
            displayValueAxis: true,
            description:      '',
            axisSize:         'auto',
            tickMarks: { 
                visible: true, 
                step: 1, 
                color: '#000000',
            },
            unitInterval: 5,
            minValue:     950,
            maxValue:     1080,
        },
        seriesGroups: [
            {
                type: 'line',
                series: [
                    { dataField:          'pressure',
                      lineColor:          '#000000',
                      emptyPointsDisplay: 'skip',
                      displayText:        'Gemessener Luftdruck'
                    }
                ]
            },
            {
                type: 'scatter',
                series: [
                    { dataField:          'fc_pressure',
                      symbolType:         'circle',
                      symbolSize:         1,
                      lineColor:          '#a6a6a6',
                      emptyPointsDisplay: 'skip',
                      displayText:        'Vorhersage Luftdruck'                            
                    },
                ],
            },
        ],
    };
    // setup the pressure chart
    $('#presFunc').jqxChart(pSettings);
}
/*
=====================
Set up humidity chart
===================== */
function setupHumidityDiagram() {
    // Specify settings
    var hSettings = {
        title:             '',
        description:       '',
        showLegend:        false,
        animationDuration: 500,
        showBorderLine:    false,
        source:            dataAdapterList,
        colorScheme:       'scheme05',
        xAxis:
        {
            textRotationAngle: 90,
            valuesOnTicks:     true,
            dataField:         'timestamp',
            type:              'date',
            baseUnit:          'hour',
            unitInterval:      2,
            formatFunction: function (value) {
                return $.jqx.dataFormat.formatdate(value, 'HH:mm');
            },
            showTickMarks:     true,
        },
        valueAxis:{
            displayValueAxis:  true,
            description:       '',
            axisSize:          'auto',
            tickMarks: { 
                visible: true,
                step: 1,
                color: '#000000',
            },
            unitInterval: 10,
            minValue:     0,
            maxValue:     100
        },
        seriesGroups: [
            {
                type: 'line',
                series: [
                    { dataField:          'humidity',
                      lineColor:          '#000000',
                      emptyPointsDisplay: 'skip',
                      displayText:        'Gemessene Luftfeuchtigkeit',
                    },
                ],
            },
            {
                type: 'scatter',
                series: [
                    { dataField:          'fc_humidity',
                      symbolType:         'circle',
                      symbolSize:         1,
                      lineColor:          '#a6a6a6',
                      emptyPointsDisplay: 'skip',
                      displayText:        'Vorhersage Luftfeuchtigkeit'                            
                    }
                ]
            }
        ]
    };
    // setup the humidity chart
    $('#humiFunc').jqxChart(hSettings);
}
/*
===================================
Set up data adapter hourly forecast
=================================== */
function setupDataAdapterFcHour() {
    // specify forecast data
    sourceFcHour = {
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

    dataAdapterFcHour = new $.jqx.dataAdapter(sourceFcHour,
    {
        autoBind: true,
        async: false,
        downloadComplete: function () { },
        loadComplete:     function () { },
        loadError:        function () { },
    });
}
/*
========================
Define various renderers 
======================== */
function defineRenderers() {

    // renderer for icons
    iconrenderer = function(row, datafield, value) {
        return '<img class="snw-icon" src="./icons/' + value + '.png"/>';
    }

    // renderer for alerts
    alertrenderer = function(row, datafield, value) {
        if (value > 0){
            return '<img class="snw-icon" src="./icons/alert.png"/>';
        } else {
            return '';
        };
    }

    // renderer for temperature
    temprenderer = function(row, datafield, value) {
        return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
              + value.toLocaleString(undefined, 
                                    {
                                     minimumFractionDigits: 1, 
                                     maximumFractionDigits: 1,
                                    }) 
              + ' °C</div>';
    }

    // renderer for rain/snow
    poprenderer = function(row, datafield, value) {
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
        };
    }

    // renderer for pressure
    presrenderer = function(row, datafield, value) {
        return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
              + value.toLocaleString(undefined, 
                                    {
                                     minimumFractionDigits: 0, 
                                     maximumFractionDigits: 0,
                                    }) 
              + ' hPa</div>';
    }

    // renderer for percentage
    percrenderer = function(row, datafield, value) {
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
        };
    }

    // renderer for distance
    distrenderer = function(row, datafield, value) {
        if (value > 0){
            return '<div class="jqx-grid-cell-right-align" style="margin-top: 8px;">' 
                + value.toLocaleString(undefined, 
                                        {
                                        minimumFractionDigits: 0, 
                                        maximumFractionDigits: 0,
                                        }) 
                + ' m</div>';
        } else {
            return "";
        };
    }

    // renderer for UV index
    uvrenderer = function(row, datafield, value) {
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
        };
    }

    // renderer for speed
    speedrenderer = function(row, datafield, value) {
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
        };
    }

    // renderer for direction
    dirrenderer = function(row, datafield, value) {
        if        (value > 338){
            return '<img class="snw-icon" src="./icons/dir180.png"/>';
        } else if (value > 292){
            return '<img class="snw-icon" src="./icons/dir135.png"/>';
        } else if (value > 248){
            return '<img class="snw-icon" src="./icons/dir090.png"/>';
        } else if (value > 202){
            return '<img class="snw-icon" src="./icons/dir045.png"/>';
        } else if (value > 158){
            return '<img class="snw-icon" src="./icons/dir000.png"/>';
        } else if (value > 113){
            return '<img class="snw-icon" src="./icons/dir315.png"/>';
        } else if (value > 68){
            return '<img class="snw-icon" src="./icons/dir270.png"/>';
        } else if (value > 22){
            return '<img class="snw-icon" src="./icons/dir225.png"/>';
        } else {
            return '<img class="snw-icon" src="./icons/dir180.png"/>';
        };
    }
    // renderer for day/night column
    daynightrenderer = function(row, datafield, value) {
        return "";
    }

    // renderer for property
    propertyrenderer = function(row, datafield, value) {
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

    // Renderer for data values in transposed table
    // Rendering is row specific which is not supported in jQWidgets exept through a renderer
    dvalrenderer = function(row, datafield, value) {
        switch (row){
            case 0 :
                var val = new Date(value);
                var wdn = val.getDay();
                var wds = days['namesAbbr'][wdn];
                //var ds  = val.getDate().toString().padStart(2, '0');
                var ds  = val.getDate().toString();
                if (ds.length < 2) {
                    ds = '0' + ds
                };
                var mn  = val.getMonth() + 1;
                //var ms  = mn.toString().padStart(2, '0')
                var ms  = mn.toString()
                if (ms.length < 2) {
                    ms = '0' + ms
                };
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
                    return '<img class="snw-icon" src="./icons/dir180.png"/>';
                } else if (value > 292){
                    return '<img class="snw-icon" src="./icons/dir135.png"/>';
                } else if (value > 248){
                    return '<img class="snw-icon" src="./icons/dir090.png"/>';
                } else if (value > 202){
                    return '<img class="snw-icon" src="./icons/dir045.png"/>';
                } else if (value > 158){
                    return '<img class="snw-icon" src="./icons/dir000.png"/>';
                } else if (value > 113){
                    return '<img class="snw-icon" src="./icons/dir315.png"/>';
                } else if (value > 68){
                    return '<img class="snw-icon" src="./icons/dir270.png"/>';
                } else if (value > 22){
                    return '<img class="snw-icon" src="./icons/dir225.png"/>';
                } else {
                    return '<img class="snw-icon" src="./icons/dir180.png"/>';
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
                return '<img class="snw-icon" src="./icons/' + value + '.png"/>';
            case 20: 
                if (value > 0){
                    return '<img class="snw-icon" src="./icons/alert.png"/>';
                } else {
                    return '';
                }
        }
    }
}
/*
===========================
define variable class names 
=========================== */
function defineVariableClassNames() {
    // class for temperature
    tempclassname = function(row, column, value, data) {

        if (value > 40){
            return 'snw-Temperature_p40';
        } else if (value > 30){
            return 'snw-Temperature_p30';
        } else if (value > 20){
            return 'snw-Temperature_p20';
        } else if (value > 10){
            return 'snw-Temperature_p10';
        } else if (value > 5){
            return 'snw-Temperature_p05';
        } else if (value > 0){
            return 'snw-Temperature_p00';
        } else if (value > -5){
            return 'snw-Temperature_m05';
        } else if (value > -10){
            return 'snw-Temperature_m10';
        } else if (value > -20){
            return 'snw-Temperature_m20';
        } else {
            return 'snw-Temperature_m30';
        };
    };

    // class for day/night column
    daynightclassname = function(row, column, value, data) {
        if (value == 1){
            return 'snw-timeday'
        } else {
            return 'snw-timenight'
        };
    };

    // class for temperature in transposed grid for daily forecast.
    // Here the class is row-dependent.
    dvalclassname = function(row, column, value, data) {
        switch (row){
            case 0 :
                return 'jqx-widget-header jqx-grid-header';
            case 1 : 
            case 2 : 
                return '';
            case 3 :
            case 4 : 
            case 5 : 
            case 6 : 
            case 7 : 
            case 8 : 
                if (value > 40){
                    return 'snw-Temperature_p40';
                } else if (value > 30){
                    return 'snw-Temperature_p30';
                } else if (value > 20){
                    return 'snw-Temperature_p20';
                } else if (value > 10){
                    return 'snw-Temperature_p10';
                } else if (value > 5){
                    return 'snw-Temperature_p05';
                } else if (value > 0){
                    return 'snw-Temperature_p00';
                } else if (value > -5){
                    return 'snw-Temperature_m05';
                } else if (value > -10){
                    return 'snw-Temperature_m10';
                } else if (value > -20){
                    return 'snw-Temperature_m20';
                } else {
                    return 'snw-Temperature_m30';
                }
            case 9  :
            case 10 : 
            case 11 : 
            case 12 : 
            case 13 : 
            case 14 : 
            case 15 : 
            case 16 : 
            case 17 : 
            case 18 : 
            case 19 : 
            case 20 : 
                return '';
        };
    };
}
/*
========================
Define grid localization 
======================== */
function defineGridLocalization() {
    // Grid localization
    // TODO: internationalization
    localizationobj = {};
    localizationobj.decimalseparator   = ",";
    localizationobj.thousandsseparator = ".";
    days = {
        // full day names
        names: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
        // abbreviated day names
        namesAbbr: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        // shortest day names
        namesShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    };
    localizationobj.days = days;
    months = {
        // full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
        names: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember", ""],
        // abbreviated month names
        namesAbbr: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez", ""],
    };
    localizationobj.months = months;
}
/*
===========================
Set up hourly forecast grid
=========================== */
function setupHourlyForecastGrid() {
    // Specify settings
    var fcHourSettings = {
        source: sourceFcHour,
        height: 915,
        width:  800,
                        
        columns: [
            { 
                text:          i18next.t('time'), 
                datafield:     'timestamp', 
                cellsformat:   'ddd dd.MM HH:mm', 
                align:         'right', 
                cellsalign:    'right', 
                width:         115,
                pinned:        true,
            },
            { 
                text:          'T', 
                datafield:     'isday', 
                cellsrenderer: daynightrenderer,
                cellclassname: daynightclassname,
                width:         5,
                pinned:        true,
            },
            { 
                text:          'Icon', 
                datafield:     'icon',
                align:         'center', 
                cellsalign:    'center', 
                width:         55,
                cellsrenderer: iconrenderer,
            },
            { 
                text:          'Temp.', 
                datafield:     'temperature', 
                cellsformat:   'f1', 
                align:         'right', 
                cellsalign:    'right', 
                width:         62,
                cellsrenderer: temprenderer,
                cellclassname: tempclassname,
            },
            { 
                text:          'Beschreibung', 
                datafield:     'description',
                align:         'left', 
                cellsalign:    'left', 
                width:         150,
            },
            { 
                text:          'Alarme', 
                datafield:     'alerts',
                align:         'center', 
                cellsalign:    'center', 
                width:         55,
                cellsrenderer: alertrenderer,
            },
            { 
                text:          'Regen', 
                datafield:     'rain',
                cellsformat:   'f2', 
                align:         'right', 
                cellsalign:    'right', 
                width:         88,
                cellsrenderer: poprenderer,
            },
            { 
                text:          'Schnee', 
                datafield:     'snow',
                align:         'right', 
                cellsformat:   'f2', 
                cellsalign:    'right', 
                width:         88,
                cellsrenderer: poprenderer,
            },
            { 
                text:          'Luftdruck', 
                datafield:     'pressure',
                cellsformat:   'f', 
                align:         'right', 
                cellsalign:    'right', 
                width:         77,
                cellsrenderer: presrenderer,
            },
            { 
                text:          'Luftfcht.', 
                datafield:     'humidity',
                align:         'right', 
                cellsalign:    'right', 
                width:         67,
                cellsrenderer: percrenderer,
            },
            { 
                text:          'Wolken', 
                datafield:     'clouds',
                align:         'right', 
                cellsalign:    'right', 
                width:         60,
                cellsrenderer: percrenderer,
            },
            { 
                text:          'UV Index', 
                datafield:     'uvi',
                cellsformat:   'f2', 
                align:         'right', 
                cellsalign:    'right', 
                width:         70,
                cellsrenderer: uvrenderer,
            },
            { 
                text:          'Sichtweite', 
                datafield:     'visibility',
                cellsformat:   'n', 
                align:         'right', 
                cellsalign:    'right', 
                width:         85,
                cellsrenderer: distrenderer,
            },
            { 
                text:          'Windgeschw.', 
                datafield:     'windspeed',
                cellsformat:   'f1', 
                align:         'right', 
                cellsalign:    'right', 
                width:         95,
                cellsrenderer: speedrenderer,
            },
            { 
                text:          'Windrichtung', 
                datafield:     'winddir',
                align:         'right', 
                cellsalign:    'right', 
                width:         95,
                cellsrenderer: dirrenderer,
            },
        ]
     }
    // setup the hourly forecast table
    $("#forecastHourlyTab").jqxGrid(fcHourSettings);
    $("#forecastHourlyTab").jqxGrid('localizestrings', localizationobj);
}
/*
==============================
Set up data adapter for alerts
============================== */
function setupDataAdapterAlerts() {
    // Specify alert data
    sourceFcAlerts = {
        datatype: "json",
        datafields: [
            { name: 'start',        type: 'date'},
            { name: 'end',          type: 'date'},
            { name: 'event',        type: 'string'},
            { name: 'sender_name',  type: 'string'},
            { name: 'description',  type: 'string'},
        ],
        url: 'scripts/weatherForecastAlerts.php',
        async: false,
    };

    dataAdapterFcAlerts = new $.jqx.dataAdapter(sourceFcAlerts,
    {
        autoBind: true,
        async: false,
        downloadComplete: function () { },
        loadComplete:     function () { },
        loadError:        function () { },
    });
}
/*
==================
Set up alerts grid
================== */
function setupAlertsGrid() {
    // Specify grid settings
    var fcAlertsSettings = {
        source:        sourceFcAlerts,
        width:         800,
        autorowheight: true,
        autoheight:    true,
        columns: [
            { 
                text:        'Beginn', 
                datafield:   'start', 
                cellsformat: 'ddd dd.MM HH:mm', 
                align:       'right', 
                cellsalign:  'right', 
                width:       120,
            },
            { 
                text:        'Ende', 
                datafield:   'end', 
                cellsformat: 'ddd dd.MM HH:mm', 
                align:       'right', 
                cellsalign:  'right', 
                width:       120,
            },
            { 
                text:        'Ereignis', 
                datafield:   'event', 
                width:       140,
            },
            { 
                text:        'Beschreibung', 
                datafield:   'description', 
                width:       400,
            },
        ],
     }
    // setup the alert grid
    $("#forecastAlertsTab").jqxGrid(fcAlertsSettings);
    $("#forecastAlertsTab").jqxGrid('localizestrings', localizationobj);
}
/*
======================================
Set up data adapter for daily forecast
====================================== */
function setupDataAdapterFcDaily() {
    // Specify data source
    sourceFcDay = {
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

    dataAdapterFcDay = new $.jqx.dataAdapter(sourceFcDay,
    {
        autoBind: true,
        async:    false,
        downloadComplete: function () { },
        loadComplete:     function () { },
        loadError:        function () { },
    });
}
/*
==========================
Set up daily forecast grid
========================== */
function setupDailyForecastGrid() {

    // prepare grid daily forecast
    var fcDaySettings = {
        source:        sourceFcDay,
        width:         800,
        autoheight:    true,
        autorowheight: true,
        showheader:    false,
        columns: [
            { 
                text:          'Eigenschaft', 
                datafield:     'property', 
                width:         120,
                pinned:        true,
                cellsrenderer: propertyrenderer,
            },
            { 
                text:          'Tag 1', 
                datafield:     'day_01', 
                width:         85,
                cellsalign:    'right', 
                cellsrenderer: dvalrenderer,
                cellclassname: dvalclassname,
            },
            { 
                text:          'Tag 2', 
                datafield:     'day_02', 
                width:         85,
                cellsalign:    'right', 
                cellsrenderer: dvalrenderer,
                cellclassname: dvalclassname,
            },
            { 
                text:          'Tag 3', 
                datafield:     'day_03', 
                width:         85,
                cellsalign:    'right', 
                cellsrenderer: dvalrenderer,
                cellclassname: dvalclassname,
            },
            { 
                text:          'Tag 4', 
                datafield:     'day_04', 
                width:         85,
                cellsalign:    'right', 
                cellsrenderer: dvalrenderer,
                cellclassname: dvalclassname,
            },
            { 
                text:          'Tag 5', 
                datafield:     'day_05', 
                width:         85,
                cellsalign:    'right', 
                cellsrenderer: dvalrenderer,
                cellclassname: dvalclassname,
            },
            { 
                text:          'Tag 6', 
                datafield:     'day_06', 
                width:         85,
                cellsalign:    'right', 
                cellsrenderer: dvalrenderer,
                cellclassname: dvalclassname,
            },
            { 
                text:          'Tag 7', 
                datafield:     'day_07', 
                width:         85,
                cellsalign:    'right', 
                cellsrenderer: dvalrenderer,
                cellclassname: dvalclassname,
            },
            { 
                text:          'Tag 8', 
                datafield:     'day_08', 
                width:         85,
                cellsalign:    'right', 
                cellsrenderer: dvalrenderer,
                cellclassname: dvalclassname,
            },
        ],
     };
    // setup the daily forecast table
    $("#forecastDailyTab").jqxGrid(fcDaySettings);
    $("#forecastDailyTab").jqxGrid('localizestrings', localizationobj);
}
/*
==============
Set up buttons
============== */
function setupButtons() {
    // Refresh button
    $("#refreshbutton").jqxButton({ 
        width: '150',
        height: '25',
    });
    $('#refreshbutton').click(function() {
        dataAdapterRange.dataBind();
        dataAdapterList.dataBind();
        $('#tempFunc').jqxChart('refresh');
        $('#presFunc').jqxChart('refresh');
        $('#humiFunc').jqxChart('refresh');
        $('#forecastHourlyTab').jqxGrid('updatebounddata');
        $('#forecastDailyTab').jqxGrid('updatebounddata');
        $('#forecastAlertsTab').jqxGrid('updatebounddata');
    });

    // Overview button
    $("#overviewbutton").jqxLinkButton({
        width: '150',
        height: '25',
    });
    $('#overviewbutton').click(function() {
    });

    // Language select dropdown list
    lngSource = getLngList();

    $("#lngselect").jqxDropDownList({ 
        source:             lngSource, 
        width:              '70px', 
        height:             '25px',
        selectedIndex:      getLngIndex(lngSource),
        autoDropDownHeight: true,

    });
    $('#lngselect').on('select', function (event) {
        var args = event.args;
        var item = $('#lngselect').jqxDropDownList('getItem', args.index);
        var lng  = item.label;
        i18next.changeLanguage(lng, function(err, t) {
            if (err) {
                return console.log('Error in i18next when changing language to ' + lng);
            }
            localize();
        });
    });
}
/*
===================
Main
=================== */
$(document).ready(function() {
    //
    // Localization
    var root = location.pathname.slice(0, location.pathname.indexOf('/', 1));
    i18next.use(i18nextHttpBackend);
    i18next.use(i18nextBrowserLanguageDetector);
    i18next.init({
        detection: {
        },
        supportedLngs: supportedLangs,
        fallbackLng: fallbackLangs,
        debug: true,
        backend: {
            loadPath: root + localesPath + '/snw_{{lng}}.json'
        },
    }, function(err, t) {
        jqueryI18next.init(i18next, $);
        localize();
        //
        // Current data
        //
        // Setup thermometer widget
        setupThermometer();
        // Setup barometer widget
        setupBarometer();
        // Setup barometer widget
        setupHygrometer();
        // Set up data adapter for thermometer, barometer and hygrometer
        setupDataAdapterRange();
        // Set up data adapter for temperature, pressure and humidity diagrams
        setupDataAdapterList();
        // Set up temperature chart
        setupTemperatureDiagram();
        // Set up pressure chart
        setupPressureDiagram();
        // Set up humidity chart
        setupHumidityDiagram();
        //
        // Hourly forecast
        //
        // Set up data adapter hourly forecast
        setupDataAdapterFcHour();
        // Define various renderers 
        defineRenderers();
        // Define variable class names 
        defineVariableClassNames();
        // Define grid localization 
        defineGridLocalization();
        // Set up hourly forecast grid
        setupHourlyForecastGrid();
        //
        // Alertts grid
        //
        // Set up data adapter for alerts
        setupDataAdapterAlerts();
        // Set up alerts grid
        setupAlertsGrid();
        //
        // Daily forecast grid
        //
        // Set up data adapter for daily forecast
        setupDataAdapterFcDaily();
        // Set up daily forecast grid
        setupDailyForecastGrid();
        //
        // Buttons
        //
        setupButtons();
    });
});
