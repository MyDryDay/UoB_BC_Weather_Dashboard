$(document).ready(function(){
    // A function is defined to get the city name from the object returned from the AJAX call
    // The city name is then added as text to the element with an id of "#cityName"
    var displayCity = function(serverResponse){
        var cityName = serverResponse[0].local_names.ascii;
        $("#cityName").text(cityName);
    } 

    // A function is defined to get the current weather conditions in a specific city from the object returned from the AJAX call
    // The data is then added as text to the respective HTML elements
    var displayCurrent = function(serverResponse){
        var temp = serverResponse.current.temp;
        var humidity = serverResponse.current.humidity;
        var windSpeed = (serverResponse.current.wind_speed) * 3.6;
        var uvIndex = serverResponse.current.uvi;
        $("#temperature").text("Temperature: " + temp.toFixed(2));
        $("#temperature").append("&deg;C");
        $("#humidity").text("Relative Humidity: " + humidity + "%");
        $("#windSpeed").text("Wind Speed: " + windSpeed.toFixed(2) + "kmph");
        $("#uvIndexBtn").text(uvIndex);

        var currIcon = serverResponse.current.weather[0].icon;
        var currIconURL = "http://openweathermap.org/img/wn/" + currIcon + ".png"
        // Here, the unix time returned from the object is converted into a readable, human format
        var unixTime = serverResponse.current.dt;
        var convToMillisecs = unixTime * 1000;
        var dateObject = new Date(convToMillisecs);
        var humanDate = dateObject.toLocaleString("en-GB", {day: "numeric", month: "numeric", year: "numeric"});
        $("#cityName").append(" - " + humanDate);
        $("#cityName").append("<img src='" + currIconURL + "'>");

        // An if/else statement is declared here to determine the background colour of the UV Index element
        // The colour coresponds to how intense the UV Index on that particular day in that particular city
        if(uvIndex < 3){
            $("#uvIndexBtn").attr("class", "btn btn-primary btn-sm");
        } else if(uvIndex < 5){
            $("#uvIndexBtn").attr("class", "btn btn-success btn-sm");
        } else{
            $("#uvIndexBtn").attr("class", "btn btn-danger btn-sm");
        }

    }

    // A function is declared to retrieve data about the weather conditions for the upcoming 5 days
    var display5Day = function(serverResponse){

        // This for loop ensures that only the next 5 days are included (begins at 1 because 0 would be the current day which is already displayed in more detail)
        for(var i = 1; i <= 5; i++){
            var dailyTemp = serverResponse.daily[i].temp.day;
            var dailyHumidity = serverResponse.daily[i].humidity;
            // Once again, the unix time is converted into a readable, human format
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

    // A function is declared that saves any searches the user makes to their local storage
    var saveSearch = function(){
        // Here a variable is assigned to the "History" item if it exists, if not an empty array is created
        var searchHistory = JSON.parse(localStorage.getItem("History")) || [];
        // A variable for the newest search query is created
        var newSearch = $("#searchQuery").val();
        // This variable is then stored in the local storage with the key "City"
        localStorage.setItem("City", newSearch);
        // This new search query is then pushed to the "searchHistory" array
        searchHistory.push(newSearch);
        console.log(searchHistory);
        // This updated array is then saved to the local storage once more
        localStorage.setItem("History", JSON.stringify(searchHistory));
    }

    var writeSearch = function(){
        // The saveSearch function is called here so we have access to the array
        saveSearch();
        // Here, a variable is assigned to the "History" item in local storage. This item already exists as saveSearch has already been called
        var searchHistory = JSON.parse(localStorage.getItem("History"));
        // The "#searchHistory" element is then emptied before looping through the searchHistory array
        $("#searchHistory").empty();
        // searchHistory is looped through, prepending each item to a button in the #searchHistory element
        for(var i = 0; i < searchHistory.length; i++){
            $("#searchHistory").prepend("<li class='searchItem list-group-item list-group-flush' id='item" + [i] + "'></li>");
            $("#item" + [i]).text(searchHistory[i]);
        }
    }
    // Here the API Key is defined
    var APIKey = "c7fb2f80502825ecbe90a5fece0767e4"; 

    // This function checks to see if the searchQuery field is empty, if it's not it will assign the value of "#searchQuery" to q
    // It then calls the ajaxCall function passign q as a parameter
    function findCity(){
        if ($("#searchQuery").val() !== ""){
            var q = $("#searchQuery").val();
            ajaxCall(q);
        }
    }

    var ajaxCall = function(q){
        // These variables takes the user's input from the search bar and add them to the queryURL 
        // var q = $("#searchQuery").val();
        var queryURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + q + "&appid=" + APIKey;

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
    }

    // This function sets a variable for where the user has clicked, it then checks to see if the element clicked matches a <li> element
    // if it does, it sets the text from the target equal to variable q, and calls the ajaxCall function passing q as a parameter
    var searchFromHistory = function(event){
        var liElement = event.target;
        if(event.target.matches("li")){
            q = liElement.textContent;
            ajaxCall(q);
        }
    }

    $("#searchBtn").on("click", function(event){
        event.preventDefault();

        writeSearch();

        // ajaxCall();

        findCity();

        // Here, the DOM elements selected are being displayed
        $("#currForecast").css("display", "block");
        $("#futureForecast").css("display", "block");
        $(".searchHistory").css("display", "block");
    })

    // This on-click event causes the function searchFromHistory to be called any time the document is clicked
    // But because of the if statement in the searchFromHistory function, the function will only be called if the element in the document clicked is a <li> element
    $(document).on("click", searchFromHistory);

    $("#clearHistory").on("click", function(){
        localStorage.clear();
        $("#searchHistory").empty();
        $("#searchHistory").css("display", "none");
    })
    
})



// TO DO:
// GENERATE WEATHER ICONS FOR CURRENT FORECAST & 5-DAY FORECAST                                                                            - DONE
// CREATE SOME KIND OF IF/ELSE STATEMENT FOR THE UV INDEX. THIS SHOULD COLOUR THE VALUE DEPENDING ON THE SEVERITY OF THE UV INDEX          - DONE
// SAVE EACH WEATHER SEARCH TO LOCAL STORAGE, APPEND THE VALUES TO BUTTONS IN #searchHistory ELEMENT                                       - DONE
// HAVE EACH BUTTON IN #searchHistory SEARCH FOR THAT BUTTON'S VALUE                                                                       - DONE   