/*
========================
Chart default parameters
======================== */
// -- Start and end date
var tEnd = new Date();
var tStart = new Date(tEnd.getFullYear(), tEnd.getMonth(), 1);
// -- Content selection
var includeMeasurement = true;
var includeForecast = true;
// -- Range
const PeriodEnum = Object.freeze({ "week": 1, "month": 2, "year": 3, });
var period = PeriodEnum.month;
// -- Comparison sets
var compSets = [{
        select: true,
        year: tEnd.getFullYear(),
        month: tEnd.getMonth(),
    },
    {
        select: false,
        year: tEnd.getFullYear(),
        month: tEnd.getMonth(),
    },
    {
        select: false,
        year: tEnd.getFullYear(),
        month: tEnd.getMonth(),
    },
]

/* 
=======================
Conversion to timestamp
======================= */
Date.prototype.toDayTimestamp = function() {
    y = this.getFullYear();
    m = this.getMonth() + 1;
    ms = m.toString();
    if (ms.length < 2) {
        ms = '0' + ms
    };
    d = this.getDate();
    ds = d.toString();
    if (ds.length < 2) {
        ds = '0' + ds
    };
    ts = y + '-' + ms + '-' + ds
        //ts = y 
        //    + '-' + m.toString().padStart(2, '0') 
        //    + '-' + d.toString().padStart(2, '0');
    return ts;
};

/*
========================
Initializing
======================== */
// -- parameters controlling the data adapter query
var querydata = {
    'start': tStart.toDayTimestamp() + ' 00:00:00',
    'end': tEnd.toDayTimestamp() + ' 23:59:59',
    period,
    PeriodEnum,
    compset: [{
            name:  "cmp1",
            start: "2020-12-01 00:00:00",
            end:   "2020-12-31 23:59:59",
        },
        {
            name:  "cmp2",
            start: "2020-11-01 00:00:00",
            end:   "2020-11-30 23:59:59",
        },
    ]
};

// -- datafields
datafieldsBase= [
    { name: 'timestamp', type: 'date' },
    { name: 'year' },
    { name: 'day_year' },
    { name: 'month' },
    { name: 'day_month' },
    { name: 'week' },
    { name: 'day_week' },
];

// -- Declare global chart configuration variables
var sourceList;
var dataAdapter;
var tSettings;
var pSettings;
var hSettings;

/*
========================
Set up data adapter
======================== */
function setupDataAdapter() {
    sourceList = {
        datatype: "json",
        datafields: [
            { name: 'timestamp', type: 'date' },
            { name: 'year' },
            { name: 'day_year' },
            { name: 'month' },
            { name: 'day_month' },
            { name: 'week' },
            { name: 'day_week' },
            { name: 'temperature_ref' },
            { name: 'humidity_ref' },
            { name: 'pressure_ref' },
            { name: 'fc_temperature_ref' },
            { name: 'fc_humidity_ref' },
            { name: 'fc_pressure_ref' },
        ],
        url: 'scripts/weatherOverviewData.php',
        data: querydata,
        async: false,
    };

    dataAdapter = new $.jqx.dataAdapter(sourceList, {
        autoBind: true,
        async: false,
        downloadComplete: function() {},
        loadComplete: function() {},
        loadError: function() {},
    });
}

/*
========================
Set up temperature chart
======================== */
function setupTemperatureChart() {
    tSettings = {
        title: '',
        description: '',
        showLegend: false,
        animationDuration: 500,
        showBorderLine: false,
        source: dataAdapter,
        colorScheme: 'scheme05',
        xAxis: {
            textRotationAngle: 90,
            valuesOnTicks: true,
            dataField: 'timestamp',
            type: 'date',
            baseUnit: 'day',
            unitInterval: 1,
            formatFunction: function(value) {
                return $.jqx.dataFormat.formatdate(value, 'dd.MM.yy');
            },
            showTickMarks: true
        },
        valueAxis: {
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
        seriesGroups: [{
                type: 'line',
                series: [{
                    dataField: 'temperature_ref',
                    lineColor: '#000000',
                    emptyPointsDisplay: 'skip',
                    displayText: 'Gemessene Temperatur'
                }]
            },
            {
                type: 'scatter',
                series: [{
                    dataField: 'fc_temperature_ref',
                    symbolType: 'circle',
                    symbolSize: 1,
                    lineColor: '#a6a6a6',
                    emptyPointsDisplay: 'skip',
                    displayText: 'Vorhersage Temperatur'
                }]
            }
        ]
    };
}

/*
========================
Set up pressure chart
======================== */
function setupPressureChart() {
    pSettings = {
        title: '',
        description: '',
        showLegend: false,
        animationDuration: 500,
        showBorderLine: false,
        source: dataAdapter,
        colorScheme: 'scheme05',
        xAxis: {
            textRotationAngle: 90,
            valuesOnTicks: true,
            dataField: 'timestamp',
            type: 'date',
            baseUnit: 'day',
            unitInterval: 1,
            formatFunction: function(value) {
                return $.jqx.dataFormat.formatdate(value, 'dd.MM.yy');
            },
            showTickMarks: true
        },
        valueAxis: {
            displayValueAxis: true,
            description: '',
            axisSize: 'auto',
            tickMarks: { visible: true, step: 1, color: '#000000' },
            unitInterval: 5,
            minValue: 950,
            maxValue: 1080
        },
        seriesGroups: [{
                type: 'line',
                series: [{
                    dataField: 'pressure_ref',
                    lineColor: '#000000',
                    emptyPointsDisplay: 'skip',
                    displayText: 'Gemessener Luftdruck'
                }]
            },
            {
                type: 'scatter',
                series: [{
                    dataField: 'fc_pressure_ref',
                    symbolType: 'circle',
                    symbolSize: 1,
                    lineColor: '#a6a6a6',
                    emptyPointsDisplay: 'skip',
                    displayText: 'Vorhersage Luftdruck'
                }]
            }
        ]
    };
}

/*
========================
Set up humidity chart
======================== */
function setupHumidityChart() {
    hSettings = {
        title: '',
        description: '',
        showLegend: false,
        animationDuration: 500,
        showBorderLine: false,
        source: dataAdapter,
        colorScheme: 'scheme05',
        xAxis: {
            textRotationAngle: 90,
            valuesOnTicks: true,
            dataField: 'timestamp',
            type: 'date',
            baseUnit: 'day',
            unitInterval: 1,
            formatFunction: function(value) {
                return $.jqx.dataFormat.formatdate(value, 'dd.MM.yy');
            },
            showTickMarks: true
        },
        valueAxis: {
            displayValueAxis: true,
            description: '',
            axisSize: 'auto',
            tickMarks: { visible: true, step: 1, color: '#000000' },
            unitInterval: 10,
            minValue: 0,
            maxValue: 100
        },
        seriesGroups: [{
                type: 'line',
                series: [{
                    dataField: 'humidity_ref',
                    lineColor: '#000000',
                    emptyPointsDisplay: 'skip',
                    displayText: 'Gemessene Luftfeuchtigkeit'
                }]
            },
            {
                type: 'scatter',
                series: [{
                    dataField: 'fc_humidity_ref',
                    symbolType: 'circle',
                    symbolSize: 1,
                    lineColor: '#a6a6a6',
                    emptyPointsDisplay: 'skip',
                    displayText: 'Vorhersage Luftfeuchtigkeit'
                }]
            }
        ]
    };
}

/*
==================================
Set up Selector for display period
================================== */
function setupPeriodSelector() {
    // Setup start selector
    $("#startinput").jqxDateTimeInput({ width: '120px', height: '25px' });
    $('#startinput').jqxDateTimeInput({ culture: 'de-DE' });
    $("#startinput").jqxDateTimeInput('setDate', tStart);
    $('#startinput').on('change', function(event) {
        tStart = event.args.date;
        querydata ['start'] = tStart.toDayTimestamp() + ' 00:00:00';
        setupDataAdapter();
        dataAdapter.dataBind();
        $('#tempFunc').jqxChart('refresh');
        $('#presFunc').jqxChart('refresh');
        $('#humiFunc').jqxChart('refresh');
    });
    // Setup end selector
    $("#endinput").jqxDateTimeInput({ width: '120px', height: '25px' });
    $('#endinput').jqxDateTimeInput({ culture: 'de-DE' });
    $("#endinput").jqxDateTimeInput('setDate', tEnd);
    $('#endinput').on('change', function(event) {
        tEnd = event.args.date;
        querydata ['end']   = tEnd.toDayTimestamp() + ' 23:59:59',
        setupDataAdapter();
        dataAdapter.dataBind();
        $('#tempFunc').jqxChart('refresh');
        $('#presFunc').jqxChart('refresh');
        $('#humiFunc').jqxChart('refresh');
    });
}

/*
===========================================
Set up content selector for measured values
=========================================== */
function setupContentSelectorMeasurement() {
    //Checkboxes for content selection
    $("#selectMeasurement").jqxCheckBox({ width: 120, height: 25 });
    if (includeMeasurement == true) {
        $("#selectMeasurement").jqxCheckBox('check');
    } else {
        $("#selectMeasurement").jqxCheckBox('uncheck');
    };
    $("#selectMeasurement").bind('change', function(event) {
        var checked = event.args.checked;
        if (checked) {
            includeMeasurement = true;
            setupDataAdapter();
            dataAdapter.dataBind();
        } else {
            includeMeasurement = false;
            setupDataAdapter();
            dataAdapter.dataBind();
        };
    });
}

/*
====================================
Set up content selector for forecast
==================================== */
function setupContentSelectorForecast() {
    //Checkboxes for content selection
    $("#selectForecast").jqxCheckBox({ width: 120, height: 25 });
    if (includeForecast == true) {
        $("#selectForecast").jqxCheckBox('check');
    } else {
        $("#selectForecast").jqxCheckBox('uncheck');
    };
    $("#selectForecast").bind('change', function(event) {
        var checked = event.args.checked;
        if (checked) {
            includeForecast = true;
            setupDataAdapter();
            dataAdapter.dataBind();
        } else {
            includeForecast = false;
            setupDataAdapter();
            dataAdapter.dataBind();
        };
    });
}

/*
==============================
Set up range selector for week
============================== */
function setupRangeSelectorWeek() {
    //Radio buttons for range selection
    $("#periodWeek").jqxRadioButton({ width: 120, height: 25 });
    $("#periodWeek").bind('change', function(event) {
        var checked = event.args.checked;
        if (checked) {
            period = PeriodEnum.week;
        };
    });
}

/*
===============================
Set up range selector for month
=============================== */
function setupRangeSelectorMonth() {
    //Radio buttons for range selection
    $("#periodMonth").jqxRadioButton({ width: 120, height: 25 });
    $("#periodMonth").bind('change', function(event) {
        var checked = event.args.checked;
        if (checked) {
            period = PeriodEnum.month;
        };
    });
}

/*
==============================
Set up range selector for year
============================== */
function setupRangeSelectorYear() {
    //Radio buttons for range selection
    $("#periodYear").jqxRadioButton({ width: 120, height: 25 });
    $("#periodYear").bind('change', function(event) {
        var checked = event.args.checked;
        if (checked) {
            period = PeriodEnum.year;
        };
    });
}

/*
==========================
Set up comparison selector
========================== */
function setupComparisonSelector() {
    //Comparison - Selectors
    $("#set1select").jqxCheckBox({ width: 120, height: 25 });
    if (compSets[0]['select'] == true) {
        $("#set1select").jqxCheckBox('check');
    } else {
        $("#set1select").jqxCheckBox('uncheck');
    };
    $("#set1select").bind('change', function(event) {
        var checked = event.args.checked;
        if (checked) {
            compSets[0]['select'] = true;
        } else {
            compSets[0]['select'] = false;
        };
    });

    $("#set2select").jqxCheckBox({ width: 120, height: 25 });
    if (compSets[1]['select'] == true) {
        $("#set2select").jqxCheckBox('check');
    } else {
        $("#set2select").jqxCheckBox('uncheck');
    };
    $("#set2select").bind('change', function(event) {
        var checked = event.args.checked;
        if (checked) {
            compSets[1]['select'] = true;
        } else {
            compSets[1]['select'] = false;
        };
    });

    $("#set3select").jqxCheckBox({ width: 120, height: 25 });
    if (compSets[2]['select'] == true) {
        $("#set3select").jqxCheckBox('check');
    } else {
        $("#set3select").jqxCheckBox('uncheck');
    };
    $("#set3select").bind('change', function(event) {
        var checked = event.args.checked;
        if (checked) {
            compSets[2]['select'] = true;
        } else {
            compSets[2]['select'] = false;
        };
    });
}

/*
===================
Main
=================== */
$(document).ready(function() {

    // Set up data adapter
    setupDataAdapter();

    // Define and draw temperture chart
    setupTemperatureChart();
    $('#tempFunc').jqxChart(tSettings);

    // Define and draw pressure chart
    setupPressureChart();
    $('#presFunc').jqxChart(pSettings);

    // Define and draw humidity chart
    setupHumidityChart();
    $('#humiFunc').jqxChart(hSettings);

    // Set up selectors
    setupPeriodSelector();

    setupContentSelectorMeasurement();
    setupContentSelectorForecast();

    setupRangeSelectorWeek();
    setupRangeSelectorMonth();
    setupRangeSelectorYear();
    switch (period) {
        case PeriodEnum.week:
            $("#periodWeek").jqxRadioButton('check');
            break;
        case PeriodEnum.month:
            $("#periodMonth").jqxRadioButton('check');
            break;
        case PeriodEnum.year:
            $("#periodYear").jqxRadioButton('check');
            break;
        default:
            $("#periodMonth").jqxRadioButton('check');
            break;
    }

    setupComparisonSelector();
});