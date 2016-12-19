function attachEvents() {
    const appKey = 'kid_BJ_Ke8hZg';
    const baseUrl = `https://baas.kinvey.com/appdata/${appKey}/`;
    const username = 'guest';
    const password = 'pass';
    const authHeaders = {
        'Authorization': 'Basic ' + btoa(username + ':' + password),
        'Content-Type': 'application/json'
    };

    let btnListVenues = $('#getVenues').click(loadVenue);

    function loadVenue() {
        $.ajax({
            url: baseUrl + 'calendar/',
            method: 'GET',
            headers: authHeaders
        })
            .then(printVenue)
            .catch(displayError);
    }

    function printVenue(respond) {
        let venueDate = $('#venueDate');
        let hardcore = '23-11';
        console.log(respond.hardcore);
        // for (let date of respond) {
        //     console.log(date[1]);
        //     console.log('r');
        // }
        venueDate.val('');
    }

    function displayError(err) {
        console.log(err);
    }
}