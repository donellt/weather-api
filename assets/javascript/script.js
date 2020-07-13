// apikey assigned to variable for easy recall
const apiKey = "df49572f6bfd6690386d3ef4bddaed3c";

//allows buttons to be found in DOM
var currWeatherDiv = $("#currentWeather");
var forecastDiv = $("#weatherForecast");
var citiesArray;

// search for city when button is clicked
$("#citySubmit").click(function() {
    event.preventDefault();
    let cityName = $("#cityInput").val();
    returnCurrentWeather(cityName);
    returnWeatherForecast(cityName);
});

// last city searched shown 
$("#previousSearch").click(function() {
    let cityName = event.target.value;
    returnCurrentWeather(cityName);
    returnWeatherForecast(cityName);
})

// usage of localStorage 
if (localStorage.getItem("localWeatherSearches")) {
    citiesArray = JSON.parse(localStorage.getItem("localWeatherSearches"));
    writeSearchHistory(citiesArray);
} else {
    citiesArray = [];
};

// clear the cities in local storages 
$("#clear").click(function() {
    localStorage.clear('localWeatherSearches');
});

// access weather api based on city name input 
function returnCurrentWeather(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&APPID=${apiKey}`;

    // acquire the information from the api
    $.get(queryURL).then(function(response){
        // today's date 
        let currTime = new Date(response.dt*1000);
        // weather icon based on location 
        let weatherIcon = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;

        // display weather info based on the city searched
        currWeatherDiv.html(`
        <h2>${response.name}, ${response.sys.country} (${currTime.getMonth()+1}/${currTime.getDate()}/${currTime.getFullYear()})<img src=${weatherIcon} height="70px"></h2>
        <p>Temperature: ${response.main.temp}&#176;F</p>
        <p>Humidity: ${response.main.humidity}%</p>
        <p>Wind Speed: ${response.wind.speed} mph</p>
        `, returnUVIndex(response.coord))
        createHistoryButton(response.name);
    })
};

// access weather api forecast
function returnWeatherForecast(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&APPID=df49572f6bfd6690386d3ef4bddaed3c`;

    // acquires the information and format it onto the page
    $.get(queryURL).then(function(response){
        let forecastInfo = response.list;
        forecastDiv.empty();
        $.each(forecastInfo, function(i) {
            if (!forecastInfo[i].dt_txt.includes("12:00:00")) {
                return;
            }
            // dates of the forecast 
            let forecastDate = new Date(forecastInfo[i].dt*1000);

            // actually displays the weather icon 
            let weatherIcon = `https://openweathermap.org/img/wn/${forecastInfo[i].weather[0].icon}.png`;

            // .append the date to the five day forecast 
            forecastDiv.append(`
            <div class="col-md">
                <div class="card text-white bg-primary">
                    <div class="card-body">
                        <h4>${forecastDate.getMonth()+1}/${forecastDate.getDate()}/${forecastDate.getFullYear()}</h4>
                        <img src=${weatherIcon} alt="Icon">
                        <p>Temp: ${forecastInfo[i].main.temp}&#176;F</p>
                        <p>Humidity: ${forecastInfo[i].main.humidity}%</p>
                    </div>
                </div>
            </div>
            `)
        })
    })
};

// acquires the current IVindex for the current time
function returnUVIndex(coordinates) {
    let queryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${coordinates.lat}&lon=${coordinates.lon}&APPID=${apiKey}`;

    // access weather api to assign colors to uvindex
    $.get(queryURL).then(function(response){
        let currUVIndex = response.value;
        let uvSeverity = "green";
        let textColour = "white"

        // assign a color to uvindex based on severity
        if (currUVIndex >= 11) {
            uvSeverity = "purple";
        } else if (currUVIndex >= 8) {
            uvSeverity = "red";
        } else if (currUVIndex >= 6) {
            uvSeverity = "orange";
            textColour = "black"
        } else if (currUVIndex >= 3) {
            uvSeverity = "yellow";
            textColour = "black"
        }
        // .append the uvindex and color to the page.
        currWeatherDiv.append(`<p>UV Index: <span class="text-${textColour} uvPadding" style="background-color: ${uvSeverity};">${currUVIndex}</span></p>`);
    })
}

// makes a history of searches 
function createHistoryButton(cityName) {
    var citySearch = cityName.trim();
    var buttonCheck = $(`#previousSearch > BUTTON[value='${citySearch}']`);
    if (buttonCheck.length == 1) {
      return;
    }
    
    if (!citiesArray.includes(cityName)){
        citiesArray.push(cityName);
        localStorage.setItem("localWeatherSearches", JSON.stringify(citiesArray));
    }

    $("#previousSearch").prepend(`
    <button class="btn btn-light cityHistoryBtn" value='${cityName}'>${cityName}</button>
    `);
}

// calls writeSearchHistory function for the history of previous cities searched
function writeSearchHistory(array) {
    $.each(array, function(i) {
        createHistoryButton(array[i]);
    })
}