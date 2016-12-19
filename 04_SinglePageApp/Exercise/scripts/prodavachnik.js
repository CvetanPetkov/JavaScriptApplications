function startApp() {
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_SkvNcZm7e';
    const appSecret = 'f0a4392fa46749b48e601c37ed2cee7c';
    const authHeaders = {
        'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret),
        'content-type': 'application/json'
    };

    sessionStorage.clear();
    manageMenuItems();
    manageView('viewHome');

    $('#linkHome').click(() => manageView('viewHome'));          //  BIND EVENTS ON THE MENU ITEMS
    $('#linkLogin').click(() => manageView('viewLogin'));
    $('#linkRegister').click(() => manageView('viewRegister'));
    $('#linkListAds').click(() => manageView('viewAds'));
    $('#linkCreateAd').click(() => manageView('viewCreateAd'));
    $('#linkLogout').click(logoutUser);

    $('#formLogin').submit(loginUser);
    $('#formRegister').submit(registerUser);
    $('#formCreateAd').submit(createAd);
    $('#formEditAd').submit(editAdProcess);

    $('form').submit(function (event) {             // PREVENT DEFAULT SUBMIT
        event.preventDefault();
    });

    $(document).on({
        ajaxStart: function () {
            $('#loadingBox').show()
        },
        ajaxStop: function () {
            $('#loadingBox').hide()
        }
    });
    $('#infoBox, #errorBox').click(function () {
        $(this).fadeOut();
    });

    function manageMenuItems() {
        if (sessionStorage.getItem('authToken')) {
            $('#linkHome').show();
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkListAds').show();
            $('#linkCreateAd').show();
            $('#linkLogout').show();
        } else {
            $('#linkHome').show();
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkListAds').hide();
            $('#linkCreateAd').hide();
            $('#linkLogout').hide();
        }
    }

    function manageView(view) {
        $('main > section').hide();
        $('#' + view).show()
    }

    function loginUser() {
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };

        $.ajax({
            method: 'POST',
            url: baseUrl + 'user/' + appKey + '/login',
            headers: authHeaders,
            data: JSON.stringify(userData)
        })
            .then(loginSuccess)
            .catch(errorHandler);

        function loginSuccess(response) {
            saveSessionAuth(response);
            showHideInfoBox(response, ' login successfull.');
            manageMenuItems();
            viewAds();
            clearForms();
        }
    }

    function logoutUser() {
        manageView('viewHome');
        let user = sessionStorage.getItem('username');
        sessionStorage.clear();
        manageMenuItems();
        showHideInfoBox({username: user}, ' logout successful.');
    }

    function registerUser() {
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };

        $.ajax({
            method: 'POST',
            url: baseUrl + 'user/' + appKey,
            headers: authHeaders,
            data: JSON.stringify(userData)
        })
            .then(registerSuccess)
            .catch(errorHandler);

        function registerSuccess(response) {
            saveSessionAuth(response);
            showHideInfoBox(response, ' registered successfully.')
            viewAds();
            clearForms();
        }
    }

    function createAd() {
        let newAdData = {
            title: $('#formCreateAd input[name=title]').val(),
            description: $('#formCreateAd textarea[name=description]').val(),
            publisher: sessionStorage.getItem('username'),
            date: $('#formCreateAd input[name=datePublished]').val(),
            price: $('#formCreateAd input[name=price]').val()
        };

        $.ajax({
            method: 'POST',
            url: baseUrl + 'appdata/' + appKey + '/adverts',
            data: newAdData,
            headers: {
                authorization: 'Kinvey ' + getSessionAuth()
            }
        })
            .then(createAdSuccess)
            .catch(errorHandler);

        function createAdSuccess(response) {
            showHideInfoBox({username: 'Advert '}, 'added successfully.');
            viewAds();
            clearForms();
        }
    }

    function editAd(advert) {
        $('#formEditAd input[name="id"]').val(advert._id);
        $('#formEditAd input[name="publisher"]').val(getSessionUsername());
        $('#formEditAd input[name="title"]').val(advert.title);
        $('#formEditAd textarea[name="description"]').val(advert.description);
        $('#formEditAd input[name="datePublished"]').val(advert.date);
        $('#formEditAd input[name="price"]').val(advert.price);

        console.log($('#formEditAd textarea[name="description"]').val(advert.description));

        manageView('viewEditAd');
    }

    function editAdProcess() {
        let editedAdData = {
            title: $('#formEditAd input[name="title"]').val(),
            description: $('#formEditAd textarea[name="description"]').val(),
            publisher: $('#formEditAd input[name="publisher"]').val(),
            date: $('#formEditAd input[name="datePublished"]').val(),
            price: $('#formEditAd input[name="price"]').val()
        };

        console.log(baseUrl + 'appdata/' + appKey + '/adverts/' + $('#formEditAd input[name="id"]').val());
        console.log();
        console.log('Kinvey ' + getSessionAuth());

        $.ajax({
            method: 'PUT',
            url: baseUrl + 'appdata/' + appKey + '/adverts/' + $('#formEditAd input[name="id"]').val(),
            data: editedAdData,
            headers: {
                authorization: 'Kinvey ' + getSessionAuth(),
                contentType: 'application/json'
            }
        })
            .then(editAdSuccess)
            .catch(errorHandler);

        function editAdSuccess(response) {
            showHideInfoBox({username: 'Advert '}, 'edited successfully.');
            viewAds();
            clearForms();
        }
    }

    function deleteAd(advert) {
        $.ajax({
            method: 'DELETE',
            url: baseUrl + 'appdata/' + appKey + '/adverts/' + advert._id,
            headers: {
                authorization: 'Kinvey ' + getSessionAuth()
            }
        })
            .then(deleteAdSuccess)
            .catch(errorHandler);

        function deleteAdSuccess() {
            showHideInfoBox({username: 'Advert '}, 'deleted successfully.');
            viewAds();
        }
    }

    function viewAds() {
        $.ajax({
            method: 'GET',
            url: baseUrl + 'appdata/' + appKey + '/adverts',
            headers: {
                authorization: 'Kinvey ' + getSessionAuth()
            }
        })
            .then(viewAdsSuccess)
            .catch(errorHandler);

        function viewAdsSuccess(response) {
            manageView('viewAds');
            if (response.length == 0) {
                $('#ads').text('No advertisements available.');
            } else {
                displayAds(response);
            }
        }

        function displayAds(response) {
            $('#ads').empty();
            let table = $('<table>');
            let headers = $('<tr>');
            headers.append(
                $('<th>').text('Title'),
                $('<th>').text('Publisher'),
                $('<th>').text('Description'),
                $('<th>').text('Price'),
                $('<th>').text('Date Published'),
                $('<th>').text('Actions')
            );
            table.append(headers);

            for (let advert of response) {
                let row = $('<tr>');
                row.append(
                    $('<td>').text(advert.title),
                    $('<td>').text(advert.publisher),
                    $('<td>').text(advert.description),
                    $('<td>').text(advert.price),
                    $('<td>').text(advert.date),
                    $('<td>').append(addActionLinks(advert))
                );

                table.append(row);
            }

            table.appendTo($('#ads'));

            function addActionLinks(advert) {
                let btnDelete = $('<a href="#">').text('[Delete]').click(() => deleteAd(advert));
                let btnEdit = $('<a href="#">').text('[Edit]').click(() => editAd(advert));
                let links = [];
                if (advert._acl.creator == sessionStorage.getItem('userId')) {
                    links = [btnDelete, ' ', btnEdit];
                }

                return links;
            }
        }
    }

    function saveSessionAuth(response) {
        let username = response.username;
        let userAuthToken = response._kmd.authtoken;
        let userId = response._id;

        sessionStorage.setItem('username', username);
        sessionStorage.setItem('authToken', userAuthToken);
        sessionStorage.setItem('userId', userId);
    }

    function getSessionAuth() {
        return sessionStorage.getItem('authToken');
    }

    function getSessionUsername() {
        return sessionStorage.getItem('username');
    }

    function showHideInfoBox(response, msg) {
        $('#infoBox').text(response.username + msg).show();
        setTimeout(function () {
                $('#infoBox').fadeOut();
            }
            , 2000);
    }

    function clearForms() {
        $('#formRegister input[name=username]').val('');
        $('#formRegister input[name=passwd]').val('');
        $('#formLogin input[name=username]').val('');
        $('#formLogin input[name=passwd]').val('');
        $('#formCreateAd input[name=title]').val('');
        $('#formCreateAd textarea[name=description]').val('');
        $('#formCreateAd input[name=datePublished]').val('');
        $('#formCreateAd input[name=price]').val('');

    }

    function errorHandler(response) {
        let errMsg = JSON.stringify(response);
        if (response.readyState === 0) {
            errMsg = 'Cannot connect due to network error.';
        }
        if (response.responseJSON
            && response.responseJSON.description) {
            errMsg = response.responseJSON.description;
        }
        showError(errMsg);
    }

    function showError(errMsg) {
        $('#errorBox').text('Error: ' + errMsg);
        $('#errorBox').show();
    }
}