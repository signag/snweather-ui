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
var cmpSets = new Array();
// -- parameters controlling the data adapter query
var querydata = {
    'start': tStart.toDayTimestamp() + ' 00:00:00',
    'end': tEnd.toDayTimestamp() + ' 23:59:59',
    period,
    PeriodEnum,
    compset: cmpSets,
};

// -- Declare global chart configuration variables
var sourceList;
var datafields;
var dataAdapter;
var tSettings;
var tSeriesGroups;
var pSettings;
var pSeriesGroups;
var hSettings;
var hSeriesGroups;

/*
========================
Set up data adapter
======================== */
function setupDataAdapter() {
    sourceList = {
        datatype: "json",
        datafields: datafields,
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
        seriesGroups: tSeriesGroups,
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
        seriesGroups: pSeriesGroups,
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
        seriesGroups: hSeriesGroups,
    };
}

/*
======================
Initialize data fields
====================== */
function initializeDataFields() {
    // datafields
    datafields    = new Array();
    datafields.push({ name: 'timestamp', type: 'date' })
    datafields.push({ name: 'year' })
    datafields.push({ name: 'day_year' })
    datafields.push({ name: 'month' })
    datafields.push({ name: 'day_month' })
    datafields.push({ name: 'week' })
    datafields.push({ name: 'day_week' })

    // series groups
    tSeriesGroups = new Array();
    pSeriesGroups = new Array();
    hSeriesGroups = new Array();
}

/*
==========================================================
Add data fields for measurement data for specific data set
========================================================== */
function DataFieldsMeasurement(set) {
    // datafields for data source
    datafields.push({ name: 'temperature_' + set });
    datafields.push({ name: 'humidity_' + set });
    datafields.push({ name: 'pressure_' + set });

    // Series groups temperature
    tSeriesGroups.push({
        type: 'line',
        series: [{
            dataField: 'temperature_' + set,
            lineColor: '#000000',
            emptyPointsDisplay: 'skip',
            displayText: 'Gemessene Temperatur'
        }]
    });

    // Series groups pressure
    pSeriesGroups.push({
        type: 'line',
        series: [{
            dataField: 'pressure_' + set,
            lineColor: '#000000',
            emptyPointsDisplay: 'skip',
            displayText: 'Gemessener Luftdruck'
        }]
    });

    // Series groups humidity
    hSeriesGroups.push({
        type: 'line',
        series: [{
            dataField: 'humidity_' + set,
            lineColor: '#000000',
            emptyPointsDisplay: 'skip',
            displayText: 'Gemessene Luftfeuchtigkeit'
        }]
    });
}

/*
===========================================
Add data fields for reference forecast data
=========================================== */
function DataFieldsForecast(set) {
    // datafields for data source
    datafields.push({ name: 'fc_temperature_' + set });
    datafields.push({ name: 'fc_humidity_' + set });
    datafields.push({ name: 'fc_pressure_' + set });

    // Series groups temperature
    tSeriesGroups.push({
        type: 'scatter',
        series: [{
            dataField: 'fc_temperature_' + set,
            symbolType: 'circle',
            symbolSize: 1,
            lineColor: '#a6a6a6',
            emptyPointsDisplay: 'skip',
            displayText: 'Vorhersage Temperatur'
        }]
    });

    // Series groups pressure
    pSeriesGroups.push({
        type: 'scatter',
        series: [{
            dataField: 'fc_pressure_' + set,
            symbolType: 'circle',
            symbolSize: 1,
            lineColor: '#a6a6a6',
            emptyPointsDisplay: 'skip',
            displayText: 'Vorhersage Luftdruck'
        }]
    });

    // Series groups humidity
    hSeriesGroups.push({
        type: 'scatter',
        series: [{
            dataField: 'fc_humidity_' + set,
            symbolType: 'circle',
            symbolSize: 1,
            lineColor: '#a6a6a6',
            emptyPointsDisplay: 'skip',
            displayText: 'Vorhersage Luftfeuchtigkeit'
        }]
    });
}

/*
========================================================
Configure data fields according to current configuration
======================================================== */
function configureDataFields() {
    // Initialize
    initializeDataFields();

    // Add reference data set
    if (includeMeasurement == true) {
        DataFieldsMeasurement('ref');
    }
    if (includeForecast == true) {
        DataFieldsForecast('ref');
    }
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
        setupTemperatureChart();
        $('#tempFunc').jqxChart(tSettings);
        setupPressureChart();
        $('#presFunc').jqxChart(pSettings);
        setupHumidityChart();
        $('#humiFunc').jqxChart(hSettings);
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
        setupTemperatureChart();
        $('#tempFunc').jqxChart(tSettings);
        setupPressureChart();
        $('#presFunc').jqxChart(pSettings);
        setupHumidityChart();
        $('#humiFunc').jqxChart(hSettings);
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
            configureDataFields()
            setupDataAdapter();
            dataAdapter.dataBind();
            setupTemperatureChart();
            $('#tempFunc').jqxChart(tSettings);
            setupPressureChart();
            $('#presFunc').jqxChart(pSettings);
            setupHumidityChart();
            $('#humiFunc').jqxChart(hSettings);
        } else {
            includeMeasurement = false;
            configureDataFields()
            setupDataAdapter();
            dataAdapter.dataBind();
            setupTemperatureChart();
            $('#tempFunc').jqxChart(tSettings);
            setupPressureChart();
            $('#presFunc').jqxChart(pSettings);
            setupHumidityChart();
            $('#humiFunc').jqxChart(hSettings);
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
            configureDataFields()
            setupDataAdapter();
            dataAdapter.dataBind();
            setupTemperatureChart();
            $('#tempFunc').jqxChart(tSettings);
            setupPressureChart();
            $('#presFunc').jqxChart(pSettings);
            setupHumidityChart();
            $('#humiFunc').jqxChart(hSettings);
        } else {
            includeForecast = false;
            configureDataFields()
            setupDataAdapter();
            dataAdapter.dataBind();
            setupTemperatureChart();
            $('#tempFunc').jqxChart(tSettings);
            setupPressureChart();
            $('#presFunc').jqxChart(pSettings);
            setupHumidityChart();
            $('#humiFunc').jqxChart(hSettings);
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

    // Configure data fields
    configureDataFields()

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