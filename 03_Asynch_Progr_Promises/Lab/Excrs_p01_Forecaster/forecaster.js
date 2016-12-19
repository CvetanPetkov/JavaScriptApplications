function attachEvents() {
    const apiUrl = 'https://judgetests.firebaseio.com/locations.json';
    const apiCurrConditionUrl = 'https://judgetests.firebaseio.com/forecast/today/';
    const apiThreeDayCondition = 'https://judgetests.firebaseio.com/forecast/upcoming/';
    $('#submit').click(getWeather);

    function getWeather() {
        if ($('#location').val() != '') {
            $.ajax({
                url: apiUrl,
                method: 'GET',
            })
                .then(findLocation)
                .catch(displayError);
        }
    }

    function findLocation(respond) {
        let locationCode = '';
        for (let location of respond) {
            if (location.name == $('#location').val()) {
                locationCode = location.code;
                requestForecast(locationCode);
                break;
            }
        }
    }

    function requestForecast(locationCode) {
        let currCondition = $.ajax({
            url: apiCurrConditionUrl + locationCode + '.json',
            method: 'GET',
        });
        let threeDayForecast = $.ajax({
            url: apiThreeDayCondition + locationCode + '.json',
            method: 'GET'
        });

        Promise.all([currCondition, threeDayForecast])
            .then(displayForecast)
            .catch(displayError)
    }

    function displayForecast([currCondition, threeDayForecast]) {
        $('#forecast').css('display', 'block');
        let degreesPic = '&#176;';
        createConditionBlock(currCondition, degreesPic);
        createThreeDaysForecastBlock(threeDayForecast, degreesPic);
    }

    function switchCondition(respond) {
        switch (respond.condition) {
            case 'Sunny': return '&#x2600;';
            case 'Partly sunny': return '&#x26C5;';
            case 'Overcast': return '&#x2601;';
            case 'Rain': return '&#x2614;';
            default: return 'no data';
        }
    }

    function createConditionBlock(currCondition, degreesPic) {
        let conditionPic = switchCondition(currCondition.forecast);

        $('<span>')
            .addClass('condition symbol')
            .html(conditionPic)
            .appendTo($('#current'));

        let spanCondition = $('<span>').addClass('condition');
        spanCondition
            .append($('<span>').addClass('forecast-data').text(currCondition.name))
            .append($('<span>').addClass('forecast-data')
                .html(`${currCondition.forecast.low}${degreesPic}/${currCondition.forecast.high}${degreesPic}`))
            .append($('<span>').addClass('forecast-data').text(currCondition.forecast.condition));
        spanCondition.appendTo($('#current'));
    }

    function createThreeDaysForecastBlock(threeDayForecast, degreesPic) {
        for (let day of threeDayForecast.forecast) {
            let conditionPic = switchCondition(day);
            let spanUpcoming = $('<span>').addClass('upcoming');
            spanUpcoming
                .append($('<span>').addClass('symbol').html(conditionPic))
                .append($('<span>').addClass('forecast-data')
                    .html(`${day.low}${degreesPic}/${day.high}${degreesPic}`))
                .append($('<span>').addClass('forecast-data').text(day.condition));
            spanUpcoming.appendTo($('#upcoming'));
        }
    }

    function displayError(err) {
        $('#forecast').css('display', 'block').text('Error');
    }
}