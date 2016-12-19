function startApp() {
    let baseUrl = 'https://baas.kinvey.com/';
    let appKey = 'kid_SyB2nqSQl';
    let appSecret = '8a60b380d8bd4ed198a1e4067910728c';
    let basicAuth = 'Basic ' + btoa(appKey + ':' + appSecret);

    sessionStorage.clear();
    manageMenu();
    manageView('viewHome');

    //  BIND MENU EVENTS
    $('#linkHome').click(() => manageView('viewHome'));
    $('#linkCatalog').click(() => manageView('viewCatalog'));
    $('#linkAbout').click(() => manageView('viewCatalog'));
    $('#linkLogin').click(() => manageView('viewLogin'));
    $('#linkRegister').click(() => manageView('viewRegister'));
    $('#linkLogout').click(logoutUser);
    $('#linkCreate').click(() => manageView('viewCreate'));

    $('form').submit(function (event) {
        event.preventDefault();
    });

    $('#formRegister').submit(registerUser);
    $('#formLogin').submit(loginUser);
    $('#formCreate').submit(createTeam);
    $('#formEdit').submit(editTeam);
    $('#formRegister input[name=repeatPassword]').focus(() =>
        $('#formRegister input[name=repeatPassword]').val('').attr('type', 'password'));

    function manageMenu() {
        if (sessionStorage.getItem('authToken')) {
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkAbout').show();
            $('#linkHome').show();
            $('#linkCatalog').show();
            $('#linkLogout').show();
        } else {
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkAbout').show();
            $('#linkHome').show();
            $('#linkCatalog').hide();
            $('#linkLogout').hide();
        }
    }

    function manageView(view) {
        $('section').hide();
        $('#' + view).show();
    }

    function registerUser() {
        if ($('#formRegister input[name=password]').val() ==
            $('#formRegister input[name=repeatPassword]').val()) {
            let userData = {
                username: $('#formRegister input[name=username]').val(),
                password: $('#formRegister input[name=password]').val()
            };

            $.ajax({
                method: 'POST',
                url: baseUrl + 'user/' + appKey,
                headers: {
                    authorization: basicAuth,
                    contentType: 'application/json'
                },
                data: userData
            })
                .then(registerSuccess)
                .catch(errorHandler);

        } else {
            $('#formRegister input[name=repeatPassword]').val('').attr('type', 'text');
            $('#formRegister input[name=repeatPassword]').val('please confirm password');
        }

        function registerSuccess(response) {
            saveSessionStorage(response);
            clearForms();
            manageMenu();
            manageView('viewCatalog');
            printTeams();
        }
    }

    function createTeam() {
        let name = $('#formCreate input[name=name]').val();
        let description = $('#formCreate input[name=description]').val();
        let data = {
            name: name,
            description: description
        };

        $.ajax({
            method: 'POST',
            url: baseUrl + 'appdata/' + appKey + '/teams',
            headers: {
                authorization: getKinveyAuth(),
                contentType: 'application/json'
            },
            data: data
        })
            .then(successCreate)
            .catch(errorHandler);

        function successCreate(response) {
            clearForms();
            manageView('viewCatalog');
            printTeams();
        }
    }

    function prepareEditTeam(team) {
        $('#formEdit input[name=name]').val(team.name);
        $('#formEdit input[name=description]').val(team.description);
        manageView('viewEdit');
    }

    function editTeam(team) {
        let name = $('#formEdit input[name=name]').val();
        let description = $('#formEdit input[name=description]').val();
        let editedData = {
            name: name,
            description: description
        };

        $.ajax({
            method: 'PUT',
            url: baseUrl + 'appdata/' + appKey + '/teams/' + team._id,
            headers: {
                authorization: getKinveyAuth(),
                contentType: 'application/json'
            },
            data: editedData
        })
            .then(successEdit)
            .catch(errorHandler);

        function successEdit() {
            manageView('viewCatalog');
            printTeams();
        }
    }

    function loginUser() {
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=password]').val()
        };

        $.ajax({
            method: 'POST',
            url: baseUrl + 'user/' + appKey + '/login',
            headers: {
                authorization: basicAuth,
                contentType: 'application/json'
            },
            data: userData
        })
            .then(loginSuccess)
            .catch(errorHandler);

        function loginSuccess(response) {
            saveSessionStorage(response);
            clearForms();
            manageMenu();
            manageView('viewCatalog');
            printTeams();
        }
    }

    function logoutUser() {
        $.ajax({
            method: 'POST',
            url: baseUrl + 'user/' + appKey + '/_logout',
            headers: {
                authorization: getKinveyAuth(),
            }
        })
            .then(successLogout)
            .catch(errorHandler);

        function successLogout() {
            sessionStorage.clear();
            manageMenu();
            manageView('viewHome');
        }
    }

    function printTeams() {
        $.ajax({
            method: 'GET',
            url: baseUrl + 'appdata/' + appKey + '/teams',
            headers: {
                authorization: getKinveyAuth()
            }
        })
            .then(successGetTeams)
            .catch(errorHandler);

        function successGetTeams(response) {
            $('#contentWrapper').empty();

            for (let item of response) {
                let team = $('<div>').attr('class', 'item').attr('id', item._id);
                let title1 = $('<div>').attr('class', 'title').text('Team Name');
                let title2 = $('<div>').attr('class', 'title').text('Description');
                let teamName = $('<div>').attr('id', 'name').text(item.name);
                let teamDescription = $('<div>').attr('id', 'description').text(item.description);

                team.append(title1)
                    .append(teamName)
                    .append(title2)
                    .append(teamDescription);

                if (item._acl.creator == sessionStorage.getItem('userId')) {
                    let editButton = $('<button>')
                        .attr('type', 'button')
                        .attr('id', 'linkCreate')
                        .attr('data-id', item._id)
                        .text('Edit team');
                    team.append(editButton).click(() => console.dir(this));
                }
                $('#contentWrapper').append(team);
            }
        }
    }

    function saveSessionStorage(response) {
        let userId = response._id;
        let authToken = response._kmd.authtoken;
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('authToken', authToken);
    }

    function getKinveyAuth() {
        return 'Kinvey ' + sessionStorage.getItem('authToken');
    }

    function clearForms() {
        $('#formRegister').trigger('reset');
        $('#formLogin').trigger('reset');
        $('#formCreate').trigger('reset');
        $('#formEdit').trigger('reset');

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