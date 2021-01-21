var displayCity = function(serverResponse){
    var cityName = serverResponse[0].local_names.ascii;
    console.log(cityName);

    $("#cityName").text(cityName);
} 

var displayCurrent = function(serverResponse){
    var temp = serverResponse.current.temp;
    console.log(temp);
    var humidity = serverResponse.current.humidity;
    console.log(humidity);
    var windSpeed = (serverResponse.current.wind_speed) * 3.6;
    console.log(windSpeed);
    var uvIndex = serverResponse.current.uvi;
    console.log(uvIndex);
    $("#temperature").text("Temperature: " + temp.toFixed(2));
    $("#temperature").append("&deg;C");
    $("#humidity").text("Relative Humidity: " + humidity + "%");
    $("#windSpeed").text("Wind Speed: " + windSpeed.toFixed(2) + "kmph");
    $("#uvIndex").text("UV Index: " + uvIndex);

    var unixTime = serverResponse.current.dt;
    var convToMillisecs = unixTime * 1000;
    var dateObject = new Date(convToMillisecs);
    var humanDate = dateObject.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
    $("#cityName").append(" " + humanDate);
}

var display5Day = function(serverResponse){

    for(var i = 1; i <= 5; i++){
        var dailyTemp = serverResponse.daily[i].temp.day;
        console.log(dailyTemp);
        var dailyHumidity = serverResponse.daily[i].humidity;
        console.log(dailyHumidity);
        var unixTime = serverResponse.daily[i].dt;
        var convToMillisecs = unixTime * 1000;
        var dateObject = new Date(convToMillisecs);
        var humanDate = dateObject.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
        console.log(humanDate);

        $("#date" + [i]).text(humanDate);
        $("#temperature" + [i]).text("Temp: " + dailyTemp.toFixed(2));
        $("#temperature" + [i]).append("&deg;C");
        $("#humidity" + [i]).text("Humidity: " + dailyHumidity + "%");
    }

}


$("#searchBtn").on("click", function(event){
    event.preventDefault();
    // These variables takes the user's input from the search bar and add them to the queryURL 
    var q = $("#searchQuery").val();
    var queryURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + q + "&appid=c7fb2f80502825ecbe90a5fece0767e4";

    console.log(queryURL);

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
        console.log(lat);
        var lon = serverResponse[0].lon;
        console.log(lon);

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



