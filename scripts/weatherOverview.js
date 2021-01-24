/*
========================
Chart default parameters
======================== */
// -- Initial start and end date
var tEnd = new Date();
var tStart = new Date(tEnd.getFullYear(), tEnd.getMonth(), 1);

// -- Content selection
var includeMeasurement = true;
var includeForecast = true;

// -- Range
const PeriodEnum = Object.freeze({ "week": 1, "month": 2, "year": 3, "free": 4});
var period = PeriodEnum.month;

// -- Comparison sets
//    These are used for the comparison selector on the page
//    and serve ase base for datafields for data adapter
//    and xSeriesGroups for the charts.
//    The first set is the reference set which cannot be unselected
//    It's period range determins the x-axis value range on the charts.

//    If additional sets are added, also related table rows in overview.html must be added!
//    Consistency of compSet data (e.g. week, tStart, tEnd) 
//    under consideration of period will be assured during initialization
var compSets = [{
        select: true,
        year:   tEnd.getFullYear(),
        month:  tEnd.getMonth() + 1,
        week:   1,
        tStart: tStart,
        tEnd:   tEnd, 
        setName:'REF',
        setCol: '#000000'
    },
    {
        select: false,
        year: tEnd.getFullYear() - 1,
        month: tEnd.getMonth() + 1,
        week: 1,
        tStart: tStart,
        tEnd:   tEnd, 
        setName: 'CO1',
        setCol: '#FF0000'
    },
    {
        select: false,
        year: tEnd.getFullYear() - 2,
        month: tEnd.getMonth() + 1,
        week: 1,
        tStart: tStart,
        tEnd:   tEnd, 
        setName: 'CO2',
        setCol: '#0000FF'
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
=========================
Last day of month as date
========================= */
Date.prototype.lastDayInMonth = function() {
    var y = this.getFullYear();
    var m = this.getMonth() + 1;
    var d = new Date(y, m, 1);
    d.setDate(d.getDate() - 1);
    return d;
};

/* 
========================================================
Return the ISO week number

Taken from 
https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php  
========================================================= */
Date.prototype.getWeekNumber = function(){
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
}

/* 
========================================================
For a given date, get the ISO week number

Taken from 
https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php  
 
Based on information at:
http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
 
Algorithm is to find nearest thursday, it's year
is the year of the week number. Then get weeks
between that date and the first day of that year.
 
Note that dates in one year can be weeks of previous
or next year, overlap is up to 3 days.
 
e.g. 2014/12/29 is Monday in week  1 of 2015
     2012/1/1   is Sunday in week 52 of 2011
========================================================= */
function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
}

/* 
==============================================================
Return the start of a week as date, given week number and year

Taken from 
https://stackoverflow.com/questions/16590500/javascript-calculate-date-from-week-number  
============================================================== */
function getStartOfWeek(y, w){
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;    
}

/*
==============================================
Determine First day of week and return as date
============================================== */
function firstDayOfWeek(date) {
    d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var wd = d.getDay() || 7;  
    if( wd !== 1 ) 
        d.setHours(-24 * (wd - 1)); 
    return d;
}

/*
========================
Initializing
======================== */
// -- Auto refresh
var autoRefresh = true;
var refreshRequired = false;
var doNotRefresh = false;
var ignoreEvents = false;

compSets[0]['week'] = tEnd.getWeekNumber();
compSets[1]['week'] = tEnd.getWeekNumber();
compSets[2]['week'] = tEnd.getWeekNumber();

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
======================================
Set up query data from comparison sets
====================================== */
function setupQueryData() {
    cmpSets = new Array();
    var l = compSets.length;
    if (l > 1) {
        for (var i = 1; i < l; i++) {
            if (compSets[i]['select'] == true) {
                var s = compSets[i]['tStart'].toDayTimestamp()  + ' 00:00:00';
                var e = compSets[i]['tEnd'].toDayTimestamp()  + ' 23:59:59';
                cmpSets.push({
                    name: compSets[i]['setName'],
                    start: s,
                    end: e,
                });
            };
        };
    };
    querydata = {
        'start': tStart.toDayTimestamp() + ' 00:00:00',
        'end': tEnd.toDayTimestamp() + ' 23:59:59',
        period,
        PeriodEnum,
        compset: cmpSets,
    };
}

/*
========================
Set up data adapter
======================== */
function setupDataAdapter() {
    setupQueryData();
    var source = {
        datatype: "json",
        datafields: datafields,
        url: 'scripts/weatherOverviewData.php',
        data: querydata,
        async: false,
    };

    dataAdapter = new $.jqx.dataAdapter(source, {
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
=====================================================================
Initialize data fields

datafields for dataAdapter and xSeriesGroups for the charts (x=t,p,h)
are initialized simultaneously
===================================================================== */
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
=====================================================================
Add data fields for measurement data for specific data set

datafields for dataAdapter and xSeriesGroups for the charts (x=t,p,h)
are added simultaneously
===================================================================== */
function DataFieldsMeasurement(set, col) {
    // datafields for data source
    datafields.push({ name: 'temperature_' + set });
    datafields.push({ name: 'humidity_' + set });
    datafields.push({ name: 'pressure_' + set });

    // Series groups temperature
    tSeriesGroups.push({
        type: 'line',
        series: [{
            dataField: 'temperature_' + set,
            lineColor: col,
            emptyPointsDisplay: 'skip',
            displayText: set + ': Gemessene Temperatur'
        }]
    });

    // Series groups pressure
    pSeriesGroups.push({
        type: 'line',
        series: [{
            dataField: 'pressure_' + set,
            lineColor: col,
            emptyPointsDisplay: 'skip',
            displayText: set + ': Gemessener Luftdruck'
        }]
    });

    // Series groups humidity
    hSeriesGroups.push({
        type: 'line',
        series: [{
            dataField: 'humidity_' + set,
            lineColor: col,
            emptyPointsDisplay: 'skip',
            displayText: set + ': Gemessene Luftfeuchtigkeit'
        }]
    });
}

/*
=====================================================================
Add data fields for reference forecast data

datafields for dataAdapter and xSeriesGroups for the charts (x=t,p,h)
are added simultaneously
===================================================================== */
function DataFieldsForecast(set, col) {
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
            lineColor: col,
            lineColorSymbol: col,
            emptyPointsDisplay: 'skip',
            displayText: set + ': Vorhersage Temperatur'
        }]
    });

    // Series groups pressure
    pSeriesGroups.push({
        type: 'scatter',
        series: [{
            dataField: 'fc_pressure_' + set,
            symbolType: 'circle',
            symbolSize: 1,
            lineColor: col,
            lineColorSymbol: col,
            emptyPointsDisplay: 'skip',
            displayText: set + ': Vorhersage Luftdruck'
        }]
    });

    // Series groups humidity
    hSeriesGroups.push({
        type: 'scatter',
        series: [{
            dataField: 'fc_humidity_' + set,
            symbolType: 'circle',
            symbolSize: 1,
            lineColor: col,
            lineColorSymbol: col,
            emptyPointsDisplay: 'skip',
            displayText: set + ': Vorhersage Luftfeuchtigkeit'
        }]
    });
}

/*
==============================================================
Configure data fields according to current configuration

Fields for dataAdapter (datafields)
and series groups for charts (xSeriesGroups) 
for the three chart types (x=t,p,h)
are configured simultaneously.
============================================================== */
function configureDataFields() {
    // Initialize
    initializeDataFields();

    //TODO: Adjust colors */

    // Add reference data set
    if (includeMeasurement == true) {
        DataFieldsMeasurement(compSets[0]['setName'], compSets[0]['setCol']);
    };
    if (includeForecast == true) {
        DataFieldsForecast(compSets[0]['setName'], compSets[0]['setCol']);
    };

    var nrSets = compSets.length;
    for (var s = 1; s < nrSets; s++) {
        if (compSets[s]['select'] == true) {
            if (includeMeasurement == true) {
                DataFieldsMeasurement(compSets[s]['setName'], compSets[s]['setCol']);
            }
            if (includeForecast == true) {
                DataFieldsForecast(compSets[s]['setName'], compSets[s]['setCol']);
            };
        };
    };
}

/*
==================
Refresh all charts
================== */
function refreshAll(force) {
    if ((doNotRefresh == false) 
    && ((autoRefresh == true) || (force == true))) {
        // Refresh is done only if autoRefresh is activated or if forced
        // In addition the global doNotRefresh is used to avoid refresh
        // when multiple parameter change events are expected
        $("#progressbar").jqxProgressBar({ value: 10, width: 100, height: 25 });

        // Configure datafields for dataAdapter and xSeriesGroups for charts
        configureDataFields();

        //set up the dataAdapter
        setupDataAdapter();
        $("#progressbar").jqxProgressBar({ value: 20 });

        dataAdapter.dataBind();
        $("#progressbar").jqxProgressBar({ value: 40 });

        // Set up and refresh the different charts
        setupTemperatureChart();
        $('#tempFunc').jqxChart(tSettings);
        $("#progressbar").jqxProgressBar({ value: 60 });

        setupPressureChart();
        $('#presFunc').jqxChart(pSettings);
        $("#progressbar").jqxProgressBar({ value: 80 });
        
        setupHumidityChart();
        $('#humiFunc').jqxChart(hSettings);
        $("#progressbar").jqxProgressBar({ value: 100 });

        // Reset refresh indicator
        refreshRequired = false;
        // ... and disable the refresh button
        $("#refreshbutton").jqxButton({ disabled: true });

        $("#progressbar").jqxProgressBar({ value: 0 });
        //$("#progressbar").jqxProgressBar('destroy');
    } else {
        // Refresh is postponed
        // Therefore, set refresh indicator
        refreshRequired = true;
        // ... and enable the refresh button
        $("#refreshbutton").jqxButton({ disabled: false });

        // Reset the doNotRefresh every time, a refresh has been postponed
        //doNotRefresh = false;
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
        if (ignoreEvents == false) {
            tStart = event.args.date;
            period = PeriodEnum.free;
            ignoreEvents = true;
            $("#periodFree").jqxRadioButton('check');
            ignoreEvents = false;
            doNotRefresh = true;
            refreshComparisonSelectors();
            doNotRefresh = false;
            refreshAll(false);
        };
    });
    // Setup end selector
    $("#endinput").jqxDateTimeInput({ width: '120px', height: '25px' });
    $('#endinput').jqxDateTimeInput({ culture: 'de-DE' });
    $("#endinput").jqxDateTimeInput('setDate', tEnd);
    $('#endinput').on('change', function(event) {
        if (ignoreEvents == false) {
            tEnd = event.args.date;
            period = PeriodEnum.free;
            ignoreEvents = true;
            $("#periodFree").jqxRadioButton('check');
            ignoreEvents = false;
            doNotRefresh = true;
            refreshComparisonSelectors();
            doNotRefresh = false;
            refreshAll(false);
        };
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
            refreshAll(false);
        } else {
            includeMeasurement = false;
            refreshAll(false);
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
        if ((checked) && (ignoreEvents == false)) {
            includeForecast = true;
            refreshAll(false);
        } else {
            includeForecast = false;
            refreshAll(false);
        };
    });
}

/*
====================================================
Prepare compSet based on current configuration

Adjust month, week, tStart, tEnd depending on period
==================================================== */
function prepareCompSet(ind) {
    var start;
    var end;
    var tNow = new Date();
    switch(period) {
        case PeriodEnum.year:
            // Year is fix. adjust the others
            start = new Date(compSets[ind]['year'], 0, 1);
            end   = new Date(compSets[ind]['year'], 11, 31);
            compSets[ind]['tStart'] = start;
            compSets[ind]['tEnd']   = end;
            compSets[ind]['week']   = end.getWeekNumber();
            compSets[ind]['month']  = 12;
            break;
        case PeriodEnum.month:
            // Year and month are fixed. Adjust the others
            start = new Date(compSets[ind]['year'], compSets[ind]['month'] - 1, 1);
            end   = start.lastDayInMonth();
            compSets[ind]['tStart'] = start;
            compSets[ind]['tEnd']   = end;
            compSets[ind]['week']   = end.getWeekNumber();
            break;
        case PeriodEnum.week:
            // Year and week are fixed. Adjust the others
            start = getStartOfWeek(compSets[ind]['year'], compSets[ind]['week']);
            if (start > tNow) {
                start = firstDayOfWeek(tNow);
            };
            end  = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            end.setDate(start.getDate() + 6);
            m = end.getMonth();
            compSets[ind]['tStart'] = start;
            compSets[ind]['tEnd']   = end;
            compSets[ind]['week']   = end.getWeekNumber();
            compSets[ind]['month']  = m + 1;
            break;
        case PeriodEnum.free:
            // Year is fixed. start and end from global
            if (ind == 0) {
                start = tStart;
                end   = tEnd;
            } else {
                var m  = tStart.getMonth();
                var d  = tStart.getDate();
                start = new Date(compSets[ind]['year'], m, d);
                var m  = tEnd.getMonth();
                var d  = tEnd.getDate();
                end   = new Date(compSets[ind]['year'], m, d);
            }
            compSets[ind]['tStart'] = start;
            compSets[ind]['tEnd']   = end;
            compSets[ind]['week']   = end.getWeekNumber();
            break;
    };
}

/*
=======================================
Show additional inf for compSets
======================================= */
function showCompSetInfo(ind) {
    // Show set name
    var cbIdName = "#set" + ind + "name";
    $(cbIdName).text(compSets[ind].setName);

    // Color
    var cbIdColor = "#set" + ind + "color";
    $(cbIdColor).css("background-color", compSets[ind].setCol);
}

/*
=======================================
Initialize all compSets
======================================= */
function prepareCompSets() {
    var nrSets = compSets.length;
    for (var s = 0; s < nrSets; s++ ) {
        prepareCompSet(s);
        showCompSetInfo(s);
    }
}

/*
===================================================================
Set up individual comparison selector selection of year
ind : Corresponding index of compSets
==================================================================== */
function refreshComparisonSelectorYear(ind) {
    var cbId = "#set" + ind + "year";
    // Set value
    ignoreEvents = true;
    $(cbId).jqxNumberInput({ decimal: compSets[ind]['year']});
    ignoreEvents = false;
}

/*
===================================================================
Refresh individual comparison selector selection of month
ind : Corresponding index of compSets
==================================================================== */
function refreshComparisonSelectorMonth(ind) {
    var cbId = "#set" + ind + "month";
    // Set value
    ignoreEvents = true;
    $(cbId).jqxNumberInput({ decimal: compSets[ind]['month']});
    ignoreEvents = false;

    // Disable depending on period selection
    if ((period == PeriodEnum.year)
    ||  (period == PeriodEnum.week)) {
        $(cbId).jqxNumberInput({ disabled: true });
    } else {
        $(cbId).jqxNumberInput({ disabled: false });
    };
}

/*
===================================================================
Refresh individual comparison selector selection of week
ind : Corresponding index of compSets
==================================================================== */
function refreshComparisonSelectorWeek(ind) {
    var cbId = "#set" + ind + "week";
    // Set value
    ignoreEvents = true;
    $(cbId).jqxNumberInput({ decimal: compSets[ind]['week']});
    ignoreEvents = false;

    // Disable depending on period selection
    if ((period == PeriodEnum.year)
    ||  (period == PeriodEnum.month)
    ||  (period == PeriodEnum.free)) {
        $(cbId).jqxNumberInput({ disabled: true });
    } else {
        $(cbId).jqxNumberInput({ disabled: false });
    };
}

/*
===================================================================
Refresh individual comparison selector
id  : identifying part of jQuery selector (e.g. 'set1')
ind : Corresponding index of compSets
isRef : True if the selector is the reference (cannot be unselected)
==================================================================== */
function refreshComparisonSelector(ind) {
    // Year
    refreshComparisonSelectorYear(ind);
    // Month
    refreshComparisonSelectorMonth(ind);
    // Week
    refreshComparisonSelectorWeek(ind);
}

/*
=======================================
Adjust compSet based on modified values
======================================= */
function adjustCompSet(ind) {
    // Prepare compSet data
    prepareCompSet(ind);

    // Adjust display values without firing change events
    refreshComparisonSelector(ind);

    if (ind == 0){
        tStart = compSets[ind]['tStart'];
        tEnd   = compSets[ind]['tEnd'];
        ignoreEvents = true;
        $("#startinput").jqxDateTimeInput('setDate', tStart);
        ignoreEvents = true;
        $("#endinput").jqxDateTimeInput('setDate', tEnd);
        refreshAll(false);
    } else {
        if (compSets[ind]['select'] == true) {
            // Do refresh only if comparison set is active
            refreshAll(false);
        };
    };
}

/*
============================
Refresh comparison selectors
============================ */
function refreshComparisonSelectors() {
    var nrSets = compSets.length;
    for (var ind = 0; ind < nrSets; ind++) {
        adjustCompSet(ind);
    };
}

/*
===================================================================
Set up individual comparison selector selection check box
ind : Corresponding index of compSets
==================================================================== */
function setupComparisonSelectorSel(ind) {
    // Checkbox
    var cbId = "#set" + ind + "select";
    $(cbId).jqxCheckBox({ width: 25, height: 25 });
    if (compSets[ind]['select'] == true) {
        $(cbId).jqxCheckBox('check');
    } else {
        $(cbId).jqxCheckBox('uncheck');
    };
    if (ind == 0) {
        $(cbId).jqxCheckBox({ disabled: true});
    } else {
        $(cbId).jqxCheckBox({ disabled: false});
    }
    $(cbId).bind('change', function(event) {
        var checked = event.args.checked;
        if ((checked) && (ignoreEvents == false)) {
            compSets[ind]['select'] = true;
            refreshAll(false);
        } else {
            compSets[ind]['select'] = false;
            refreshAll(false);
        };
    });
}

/*
===================================================================
Set up individual comparison selector selection of year
id  : identifying part of jQuery selector (e.g. 'set1')
ind : Corresponding index of compSets
==================================================================== */
function setupComparisonSelectorYear(ind) {
    // Checkbox
    var cbId = "#set" + ind + "year";
    var settings = {
        width: '80px', 
        height: '25px',
        decimalDigits: 0,
        groupSeparator: '',
        groupSize: 4,
        inputMode: 'simple',
        spinButtons: true,
        spinMode: 'simple',
        min: 2019,
        max: 2050,
    };
    $(cbId).jqxNumberInput(settings);

    $(cbId).on('change', function(event) {
        if (ignoreEvents == false) {
            compSets[ind]['year'] = event.args.value;
            adjustCompSet(ind);
        };
    });
}

/*
===================================================================
Set up individual comparison selector selection of month
ind : Corresponding index of compSets
==================================================================== */
function setupComparisonSelectorMonth(ind) {
    // Checkbox
    var cbId = "#set" + ind + "month";
    var settings = {
        width: '63px', 
        height: '25px',
        decimalDigits: 0,
        groupSeparator: '',
        groupSize: 2,
        inputMode: 'simple',
        spinButtons: true,
        spinMode: 'simple',
        min: 1,
        max: 12,
    };
    $(cbId).jqxNumberInput(settings);

    // Register change event
    $(cbId).on('change', function(event) {
        var cbId = "#set" + ind + "month";
        if (($(cbId).jqxNumberInput('disabled') == false) 
        &&  (ignoreEvents == false)) {
            // handle only user modifications
            var value = event.args.value;
            compSets[ind]['month'] = value;
            var fdm = new Date(compSets[ind]['year'], value - 1, 1);
            var ldm = fdm.lastDayInMonth();
            compSets[ind]['week'] = ldm.getWeekNumber();
            var cbIdw = "#set" + ind + "week";
            ignoreEvents = true;
            $(cbIdw).jqxNumberInput({ decimal: compSets[ind]['week']});        
            ignoreEvents = false;
            adjustCompSet(ind);
        };
    });
}

/*
===================================================================
Set up individual comparison selector selection of week
id  : identifying part of jQuery selector (e.g. 'set1')
ind : Corresponding index of compSets
==================================================================== */
function setupComparisonSelectorWeek(ind) {
    // Checkbox
    var cbId = "#set" + ind + "week";
    var settings = {
        width: '63px', 
        height: '25px',
        decimalDigits: 0,
        groupSeparator: '',
        groupSize: 2,
        inputMode: 'simple',
        spinButtons: true,
        spinMode: 'simple',
        min: 1,
        max: 53,
    };
    $(cbId).jqxNumberInput(settings);

    // Register change event
    $(cbId).on('change', function(event) {
        var cbId = "#set" + ind + "week";
        if (($(cbId).jqxNumberInput('disabled') == false) 
        &&  (ignoreEvents == false)) {
            // handle only user modifications
            var value = event.args.value;
            compSets[ind]['week'] = value;
            var ws = getStartOfWeek(compSets[ind]['year'], value);
            var we = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate());
            we.setDate(ws.getDate() + 6);
            compSets[ind]['month'] = we.getMonth() + 1;
            var cbIdm = "#set" + ind + "month";
            ignoreEvents = true;
            $(cbIdm).jqxNumberInput({ decimal: compSets[ind]['month']});        
            ignoreEvents = false;
            adjustCompSet(ind);
        };
    });
}

/*
===================================================================
Set up individual comparison selector
id  : identifying part of jQuery selector (e.g. 'set1')
ind : Corresponding index of compSets
isRef : True if the selector is the reference (cannot be unselected)
==================================================================== */
function setupComparisonSelector(ind) {
    // Checkbox
    setupComparisonSelectorSel(ind);
    // Year
    setupComparisonSelectorYear(ind);
    // Month
    setupComparisonSelectorMonth(ind);
    // Week
    setupComparisonSelectorWeek(ind);
}

/*
===========================
Set up comparison selectors
=========================== */
function setupComparisonSelectors() {
    var nrSets = compSets.length;
    for (var ind = 0; ind < nrSets; ind++) {
        setupComparisonSelector(ind);
        refreshComparisonSelector(ind);
    };
}

/*
==============================
Set up range selector for week
============================== */
function setupRangeSelectorWeek() {
    //Radio buttons for range selection
    $("#periodWeek").jqxRadioButton({ width: 120, height: 25 });

    if (period == PeriodEnum.week) {
        $("#periodWeek").jqxRadioButton('check');
    }

    $("#periodWeek").bind('change', function(event) {
        var checked = event.args.checked;
        if ((checked) && (ignoreEvents == false)) {
            period = PeriodEnum.week;
            // Starting from tEnd, determine beginning of week
            tStart = firstDayOfWeek(tEnd);
            // Refresh comparison selectors
            doNotRefresh = true;
            refreshComparisonSelectors();
            doNotRefresh = false;
            refreshAll(false);
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

    if (period == PeriodEnum.month) {
        $("#periodMonth").jqxRadioButton('check');
    }

    $("#periodMonth").bind('change', function(event) {
        var checked = event.args.checked;
        if ((checked) && (ignoreEvents == false)) {
            period = PeriodEnum.month;
            // Starting fro tEnd, determine beginning of month
            tStart = new Date(tEnd.getFullYear(), 0, 1);
            // Refresh comparison selectors
            doNotRefresh = true;
            refreshComparisonSelectors();
            doNotRefresh = false;
            refreshAll(false);
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

    if (period == PeriodEnum.year) {
        $("#periodYear").jqxRadioButton('check');
    }

    $("#periodYear").bind('change', function(event) {
        var checked = event.args.checked;
        if ((checked) && (ignoreEvents == false)) {
            period = PeriodEnum.year;
            // Starting from tEnd, determine beginning of month
            tStart = new Date(tEnd.getFullYear(), tEnd.getMonth(), 1);
            // Refresh comparison selectors
            doNotRefresh = true;
            refreshComparisonSelectors();
            doNotRefresh = false;
            refreshAll(false);
        };
    });
}

/*
====================================
Set up range selector for free range
==================================== */
function setupRangeSelectorFree() {
    //Radio buttons for range selection
    $("#periodFree").jqxRadioButton({ width: 120, height: 25 });

    if (period == PeriodEnum.free) {
        $("#periodFree").jqxRadioButton('check');
    }

    $("#periodFree").bind('change', function(event) {
        var checked = event.args.checked;
        if ((checked) && (ignoreEvents == false)) {
            period = PeriodEnum.free;
            doNotRefresh = true;
            refreshComparisonSelectors();
            doNotRefresh = false;
            refreshAll(false);
        };
    });
}


/*
=================================
Set up check box for auto refresh
================================= */
function setupAutoRefresh() {
    //Checkbox
    $("#autoRefresh").jqxCheckBox({ width: 170, height: 25 });
    if (autoRefresh == true) {
        $("#autoRefresh").jqxCheckBox('check');
    } else {
        $("#autoRefresh").jqxCheckBox('uncheck');
    };
    $("#autoRefresh").bind('change', function(event) {
        var checked = event.args.checked;
        if ((checked) && (ignoreEvents == false)) {
            autoRefresh = true;
            if (refreshRequired == true) {
                refreshAll(false);
            }
        } else {
            autoRefresh = false;
        };
    });
}

/*
=====================
Toggle refresh button
===================== */
function toggleRefreshButton() {
    if (refreshRequired == true) {
        $("#refreshbutton").jqxButton({ disabled: false });
    } else {
        $("#refreshbutton").jqxButton({ disabled: true });
    };
}

/*
=====================
Set up refresh button
===================== */
function setupRefreshButton() {
    $("#refreshbutton").jqxButton({ width: 100, height: 25 });
    toggleRefreshButton();
    $('#refreshbutton').click(function() {
        refreshAll(true);
        $("#refreshbutton").jqxButton({ disabled: false });
    });
}

/*
===================
Set up progress bar
=================== */
function setupProgressBar() {
    $("#progressbar").jqxProgressBar({ width: 20, height: 25 });
}

/*
===================
Main
=================== */
$(document).ready(function() {
    // Auto refresh checkbox and button
    setupAutoRefresh();
    setupRefreshButton();

    // Set selector for display period
    setupPeriodSelector();

    // Set up selector for content types (measurement / forecast)
    setupContentSelectorMeasurement();
    setupContentSelectorForecast();

    // Set up radio buttons for selection of range type
    setupRangeSelectorWeek();
    setupRangeSelectorMonth();
    setupRangeSelectorYear();
    setupRangeSelectorFree();

    // Set up selectors for comparison data sets
    prepareCompSets();
    setupComparisonSelectors();

    // Configure data fields
    configureDataFields();

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
/*
*/    
});