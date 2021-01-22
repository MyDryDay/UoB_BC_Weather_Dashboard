var displayCity = function(serverResponse){
    var cityName = serverResponse[0].local_names.ascii;
    $("#cityName").text(cityName);
} 

var displayCurrent = function(serverResponse){
    var temp = serverResponse.current.temp;
    var humidity = serverResponse.current.humidity;
    var windSpeed = (serverResponse.current.wind_speed) * 3.6;
    var uvIndex = serverResponse.current.uvi;
    $("#temperature").text("Temperature: " + temp.toFixed(2));
    $("#temperature").append("&deg;C");
    $("#humidity").text("Relative Humidity: " + humidity + "%");
    $("#windSpeed").text("Wind Speed: " + windSpeed.toFixed(2) + "kmph");
    $("#uvIndex").text("UV Index: " + uvIndex);

    var currIcon = serverResponse.current.weather[0].icon;
    var currIconURL = "http://openweathermap.org/img/wn/" + currIcon + ".png"
    var unixTime = serverResponse.current.dt;
    var convToMillisecs = unixTime * 1000;
    var dateObject = new Date(convToMillisecs);
    var humanDate = dateObject.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
    $("#cityName").append(" - " + humanDate);
    $("#weatherIcon").attr("src", currIconURL);

}

var display5Day = function(serverResponse){

    for(var i = 1; i <= 5; i++){
        var dailyTemp = serverResponse.daily[i].temp.day;
        var dailyHumidity = serverResponse.daily[i].humidity;
        var unixTime = serverResponse.daily[i].dt;
        var convToMillisecs = unixTime * 1000;
        var dateObject = new Date(convToMillisecs);
        var humanDate = dateObject.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
        var dailyIcon = serverResponse.daily[i].weather[0].icon;
        var dailyIconURL = "http://openweathermap.org/img/wn/" + dailyIcon + ".png"

        $("#date" + [i]).text(humanDate);
        $("#temperature" + [i]).text("Temp: " + dailyTemp.toFixed(2));
        $("#temperature" + [i]).append("&deg;C");
        $("#humidity" + [i]).text("Humidity: " + dailyHumidity + "%");
        $("#dailyWeatherIcon" + [i]).attr("src", dailyIconURL);
    }

}

var saveSearch = function(){
    var searchHistory = JSON.parse(localStorage.getItem("History")) || [];
    var newSearch = $("#searchQuery").val();
    localStorage.setItem("City", newSearch);
    searchHistory.push(newSearch);
    console.log(searchHistory);
    localStorage.setItem("History", JSON.stringify(searchHistory));
    
    for(i = 0; i < searchHistory.length; i++){
        $("#searchHistory").append("<button id='history" + [i] + "'>");
        $("#history" + [i]).append(searchHistory + [i]);
    }
}

$("#searchBtn").on("click", function(event){
    event.preventDefault();

    saveSearch();

    // These variables takes the user's input from the search bar and add them to the queryURL 
    var q = $("#searchQuery").val();
    var queryURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + q + "&appid=c7fb2f80502825ecbe90a5fece0767e4";

    // Here, the DOM elements selected are being displayed
    $("#currForecast").css("display", "block");
    $("#futureForecast").css("display", "block");

    // The first AJAX call is initialised here to get the latitude and longitude variables we need in order to make the second AJAX call
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(serverResponse){
        // Here the function takes the latitude & longitude values from the returned objects and assigns them to a variable
        console.log(serverResponse);
        var lat = serverResponse[0].lat;
        var lon = serverResponse[0].lon;

        displayCity(serverResponse);

        // A second queryURL is built here using the variables for lat & lon
        var queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=metric&exclude=minutely,hourly,alerts&appid=c7fb2f80502825ecbe90a5fece0767e4";
        
        // A second AJAX is initialised to get the relevant weather information
        $.ajax({
            url: queryURL2,
            method: "GET"
        }).then(function(serverResponse){
            console.log(serverResponse);

            displayCurrent(serverResponse);
            display5Day(serverResponse);
        });
    });
    
    
})



// TO DO:
// GENERATE WEATHER ICONS FOR CURRENT FORECAST & 5-DAY FORECAST
// CREATE SOME KIND OF IF/ELSE STATEMENT FOR THE UV INDEX. THIS SHOULD COLOUR THE VALUE DEPENDING ON THE SEVERITY OF THE UV INDEX
// SAVE EACH WEATHER SEARCH TO LOCAL STORAGE, APPEND THE VALUES TO BUTTONS IN #searchHistory ELEMENT
// HAVE EACH BUTTON IN #searchHistory SEARCH FOR THAT BUTTON'S VALUE