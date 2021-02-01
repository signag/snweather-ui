# snweather-ui

This package includes a Web UI for <https://github.com/signag/snweatherstation>.
It visualizes measured weather data along with forecast data obtained from the archive database of **snweatherstation**.

Widgets on this page make use of the jQWidgets framework <https://www.jqwidgets.com/>.

**snweatherstation** obtains forecast data from <https://openweathermap.org/>

## Overview

### Main page

- current measurement,
- comparison measuremenr vs. forecast for the last 24 hours
- forecast for the next 24 hours
- table with 3-day openweathermap hourly forecast and alerts (all data from One Call API)
- table with 8-day forecast data

![snweather-ui](img/snweather-ui_en.png)

### Archive data

- Historical graphics for temperature, pressure and humidity
- Selectable reference period
- Selectable periods for comparison

![snweather-overview](img/snweatheroverview-ui_en.png)

## Setup

- **Precondition**: access to an archive database from [snweatherstation](https://github.com/signag/snweatherstation).
- Download / clone this package to your web server deploy directory (e.g. Apache htdocs).
- Adjust ./scripts/connect.php with the valid database connection for the [snweatherstation](https://github.com/signag/snweatherstation) database.
- For languages other than de and en, copy and translate localization files under ./locales. (the package uses [i18next](https://www.i18next.com/) for internationalization)
- Adjust the widget in the iframe at the bottom of index.html to your favorite widget.

The main page URL is **/snweather-ui/index.html**.
