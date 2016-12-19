function attachEvents() {
    const appKey = 'kid_r1lJX8eXx';
    const baseUrl = `https://baas.kinvey.com/appdata/${appKey}/countries/`;
    const username = 'guest';
    const password = 'guest';
    const authHeaders = {
        'Authorization': 'Basic ' + btoa(username + ':' + password),
        'Content-Type': 'application/json'
    };

    loadTowns();

    function loadTowns() {
        $.ajax({
            url: baseUrl,
            method: 'GET',
            headers: authHeaders
        })
            .then(printTowns)
            .catch(displayError);
    }

    function printTowns(respond) {
        for (let town of respond) {
            $('<div>')
                .text(`${town.town} is a town in ${town.country}`)
                .appendTo('body');
        }
    }

    function displayError(err) {
        console.log(err);
    }
}