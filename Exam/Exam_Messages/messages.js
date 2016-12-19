function startApp() {
    let baseUrl = 'https://baas.kinvey.com/';
    let appId = 'kid_Syh-ROcme';
    let appSecret = 'a3f33a72d18b4ddc9c5da7938b968f12';
    let registerUserUrl = 'https://baas.kinvey.com/user/' + appId;
    let loginUserUrl = 'https://baas.kinvey.com/user/' + appId + '/login';
    let logoutUserUrl = 'https://baas.kinvey.com/user/' + appId + '/_logout';
    let appUrl = 'https://baas.kinvey.com/appdata/' + appId + '/messages';
    let basicAuth = 'Basic ' + btoa(appId + ':' + appSecret);

    sessionStorage.clear();
    manageView('viewAppHome');
    manageMenuLinks();
    $('#loadingBox').hide();
    $('#infoBox').hide();
    $('#errorBox').hide();

    //  BIND EVENTS ON MENU HEADER
    $('#linkMenuAppHome').click(() => manageView('viewAppHome'));
    $('#linkMenuLogin').click(() => manageView('viewLogin'));
    $('#linkMenuRegister').click(() => manageView('viewRegister'));

    $('#linkMenuUserHome').click(() => manageView('viewUserHome'));
    $('#linkMenuMyMessages').click(() => getReceivedMessagesByUsername(getUserUsername()));
    $('#linkMenuArchiveSent').click(() => getSentMessagesByUsername(getUserUsername()));
    $('#linkMenuSendMessage').click(loadRecipients);
    $('#linkMenuLogout').click(logoutUser);

    //  BIND EVENTS ON FORM BUTTONS
    $('#formLogin').submit(loginUser);
    $('#formRegister').submit(registerUser);
    $('#formSendMessage').submit(sendMessage);

    //  BIND EVENTS ON USER HOME VIEW
    $('#linkUserHomeMyMessages').click(() => getReceivedMessagesByUsername(getUserUsername()));
    $('#linkUserHomeSendMessage').click(loadRecipients);
    $('#linkUserHomeArchiveSent').click(() => getSentMessagesByUsername(getUserUsername()));

    //  RULES
    $('form').submit(function (event) {
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


    //  AJAX CALLS
    function registerUser() {
        let username = $('#formRegister input[name=username]').val();
        let password = $('#formRegister input[name=password]').val();
        let name = $('#formRegister input[name=name]').val();

        let userData = {
            username: username,
            password: password,
            name: name
        };

        $.ajax({
            method: 'POST',
            url: registerUserUrl,
            data: userData,
            headers: {
                authorization: basicAuth,
                contentType: 'application/json'
            }
        })
            .then(successRegister)
            .catch(errorHandler);

        function successRegister(response) {
            saveSessionStorage(response);
            manageMenuLinks();
            $('#viewUserHomeHeading').text('Welcome ' + getUserUsername());
            manageView('viewUserHome');
            showInfo('Register successful.');
            clearForms();
        }
    }

    function loginUser() {
        let username = $('#formLogin input[name=username]').val();
        let password = $('#formLogin input[name=password]').val();
        let userData = {
            username: username,
            password: password
        };

        $.ajax({
            method: 'POST',
            url: loginUserUrl,
            data: userData,
            headers: {
                authorization: basicAuth,
                contentType: 'application/json'
            }
        })
            .then(successLogin)
            .catch(errorHandler);

        function successLogin(response) {
            saveSessionStorage(response);
            manageMenuLinks();
            $('#viewUserHomeHeading').text('Welcome ' + getUserUsername());
            manageView('viewUserHome');
            showInfo('Login successful.');
            clearForms();
        }
    }

    function logoutUser() {
        $.ajax({
            method: 'POST',
            url: logoutUserUrl,
            headers: {
                authorization: getKinveyAuth(),
            }
        })
            .then(successLogout)
            .catch(errorHandler);

        function successLogout() {
            sessionStorage.clear();
            manageMenuLinks();
            manageView('viewAppHome');
            showInfo('Logout successful.');
            $('#viewUserHomeHeading').text('');
        }
    }

    function getReceivedMessagesByUsername(username) {
        $.ajax({
            method: 'GET',
            url: appUrl + `?query={"recipient_username":"${username}"}`,
            headers: {
                authorization: getKinveyAuth(),
            }
        })
            .then(successGetMessagesByUsername)
            .catch(errorHandler);

        function successGetMessagesByUsername(response) {
            manageView('viewMyMessages');
            showInfo('Messages load successful.');
            renderReceivedMessages(response);
        }
    }

    function getSentMessagesByUsername(username) {
        $.ajax({
            method: 'GET',
            url: appUrl + `?query={"sender_username":"${username}"}`,
            headers: {
                authorization: getKinveyAuth(),
            }
        })
            .then(successGetSentMessagesByUsername)
            .catch(errorHandler);

        function successGetSentMessagesByUsername(response) {
            manageView('viewArchiveSent');
            showInfo('Messages load successful.');
            renderSentMessages(response);
        }
    }

    function loadRecipients() {
        $.ajax({
            method: 'GET',
            url: registerUserUrl,
            headers: {
                authorization: getKinveyAuth()
            }
        })
            .then(successLoadRecipients)
            .catch(errorHandler);

        function successLoadRecipients(response) {
            $('#msgRecipientUsername').empty();
            let select = $('#msgRecipientUsername');

            for (let user of response) {
                let option = $('<option>').val(user.name).text(formatSender(user.name, user.username));
                option.appendTo(select);
            }

            manageView('viewSendMessage');
        }
    }

    function sendMessage() {
        let message = $('#formSendMessage input[name=text]').val();
        let selectedUser = $('#msgRecipientUsername').val();

        let messageData = {
            sender_username: getUserUsername(),
            sender_name: getUserSimpleName(),
            recipient_username: selectedUser,
            text: message
        };

        $.ajax({
            method: 'POST',
            url: appUrl,
            data: messageData,
            headers: {
                authorization: getKinveyAuth(),
                contentType: 'application/json'
            }
        })
            .then(sendSuccess)
            .catch(errorHandler);

        function sendSuccess(response) {
            showInfo('Message send successful.');
            clearForms();
            getSentMessagesByUsername(getUserUsername())
        }
    }

    function deleteMessage(message) {
        $.ajax({
            method: 'DELETE',
            url: appUrl + '/' + message._id,
            headers: {
                authorization: getKinveyAuth(),
            }
        })
            .then(successDelete)
            .catch(errorHandler);

        function successDelete() {
            showInfo('Message deleted.');
            getSentMessagesByUsername(getUserUsername());
        }
    }

    //  RENDER DOM
    function renderReceivedMessages(response) {
        $('#myMessages').empty();

        let table = $('<table>');
        let tableHeading = $('<thead>');
        let headings = $('<tr>');
        headings
            .append($('<th>').text('From'))
            .append($('<th>').text('Message'))
            .append($('<th>').text('Date Received'));
        headings.appendTo(tableHeading);
        tableHeading.appendTo(table);

        if (response.length > 0) {
            let tableBody = $('<tbody>');

            for (let message of response) {
                let row = $('<tr>');
                row
                    .append($('<td>').text(formatSender(message.sender_name, message.sender_username)))
                    .append($('<td>').text(message.text))
                    .append($('<td>').text(formatDate(message._kmd.lmt)));
                row.appendTo(tableBody);
            }
            tableBody.appendTo(table);
        }

        table.appendTo($('#myMessages'));
    }

    function renderSentMessages(response) {
        $('#sentMessages').empty();

        let table = $('<table>');
        let tableHeading = $('<thead>');
        let headings = $('<tr>');
        headings
            .append($('<th>').text('To'))
            .append($('<th>').text('Message'))
            .append($('<th>').text('Date Sent'))
            .append($('<th>').text('Actions'));
        headings.appendTo(tableHeading);
        tableHeading.appendTo(table);

        if (response.length > 0) {
            let tableBody = $('<tbody>');

            for (let message of response) {
                let row = $('<tr>');
                let link = $('<td>');
                let btnDelete = $('<button>').text('Delete').click(() => deleteMessage(message));
                link.append(btnDelete);

                row
                    .append($('<td>').text(message.recipient_username))
                    .append($('<td>').text(message.text))
                    .append($('<td>').text(formatDate(message._kmd.lmt)))
                    .append(link);
                row.appendTo(tableBody);
            }
            tableBody.appendTo(table);
        }

        table.appendTo($('#sentMessages'));
    }

    // HELPERS
    function manageView(view) {
        $('main section').hide();
        $('#' + view).show();
    }

    function manageMenuLinks() {
        if (sessionStorage.getItem('authToken')) {
            $('#linkMenuAppHome').hide();
            $('#linkMenuLogin').hide();
            $('#linkMenuRegister').hide();

            $('#linkMenuUserHome').show();
            $('#linkMenuMyMessages').show();
            $('#linkMenuArchiveSent').show();
            $('#linkMenuSendMessage').show();
            $('#linkMenuLogout').show();

            $('#spanMenuLoggedInUser').show().text('Welcome, ' + getUserUsername() + '!');
        } else {
            $('#linkMenuAppHome').show();
            $('#linkMenuLogin').show();
            $('#linkMenuRegister').show();

            $('#linkMenuUserHome').hide();
            $('#linkMenuMyMessages').hide();
            $('#linkMenuArchiveSent').hide();
            $('#linkMenuSendMessage').hide();
            $('#linkMenuLogout').hide();

            $('#spanMenuLoggedInUser').hide().text('');
        }
    }

    function saveSessionStorage(response) {
        let authToken = response._kmd.authtoken;
        let username = response.username;
        let name = response.name;

        sessionStorage.setItem('authToken', authToken);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('name', name);
    }

    function getKinveyAuth() {
        return 'Kinvey ' + sessionStorage.getItem('authToken');
    }

    function getUserId() {
        return sessionStorage.getItem('authToken');
    }

    function getUserUsername() {
        return sessionStorage.getItem('username');
    }

    function getUserSimpleName() {
        return sessionStorage.getItem('name');
    }

    function clearForms() {
        $('form').trigger('reset');
    }

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function () {
            $('#infoBox').fadeOut();
        }, 3000);
    }

    function formatSender(name, username) {
        if (!name)
            return username;
        else
            return username + ' (' + name + ')';
    }

    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
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

        function showError(errMsg) {
            $('#errorBox').text('Error: ' + errMsg);
            $('#errorBox').show();
        }
    }
}