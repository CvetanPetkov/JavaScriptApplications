function startApp() {
    let baseUrl = 'https://baas.kinvey.com/';
    let appId = 'kid_H18cbsb7x';
    let appSecret = '258d0964ff0c4680a20812025fb00369';
    let registerUserUrl = 'https://baas.kinvey.com/user/' + appId;
    let loginUserUrl = 'https://baas.kinvey.com/user/' + appId + '/login';
    let appUrl = 'https://baas.kinvey.com/appdata/' + appId + '/booksApp';
    let basicAuth = 'Basic ' + btoa(appId + ':' + appSecret);

    sessionStorage.clear();
    manageView('viewHome');
    manageMenuLinks();

    $('#linkHome').click(() => manageView('vieHome'));
    $('#linkLogin').click(() => manageView('viewLogin'));
    $('#linkRegister').click(() => manageView('viewRegister'));
    $('#linkListBooks').click(getBooks);
    $('#linkCreateBook').click(() => manageView('viewCreateBook'));
    $('#linkLogout').click(logout);

    $('#formRegister').submit(registerUser);
    $('#formLogin').submit(loginUser);
    $('#formCreateBook').submit(createBook);
    $('#formEditBook').submit(editBook);

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
        let userData = {
            username: username,
            password: password
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
            getBooks();
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
            getBooks();
            clearForms();
        }
    }

    function createBook() {
        let title = $('#formCreateBook input[name=title]').val();
        let author = $('#formCreateBook input[name=author]').val();
        let description = $('#formCreateBook textarea[name=description]').val();
        let bookData = {
            title: title,
            author: author,
            description: description
        };

        $.ajax({
            method: 'POST',
            url: appUrl,
            data: bookData,
            headers: {
                authorization: getKinveyAuth(),
                contentType: 'application/json'
            }
        })
            .then(successCreate)
            .catch(errorHandler);

        function successCreate() {
            getBooks();
            clearForms();
        }
    }

    function editBook() {
        let title = $('#formEditBook input[name=title]').val();
        let author = $('#formEditBook input[name=author]').val();
        let description = $('#formEditBook textarea[name=description]').val();
        let bookData = {
            title: title,
            author: author,
            description: description
        };

        $.ajax({
            method: 'PUT',
            url: appUrl + '/' + $('#formEditBook input[name=id]').val(),
            data: bookData,
            headers: {
                authorization: getKinveyAuth(),
                contentType: 'application/json'
            }
        })
            .then(successEdit)
            .catch(errorHandler);

        function successEdit() {
            getBooks();
            clearForms();
        }
    }

    function logout() {
        sessionStorage.clear();
        $('#loggedInUser').text('');
        manageView('viewHome');
        manageMenuLinks();
    }

    function getBooks() {
        $.ajax({
            method: 'GET',
            url: appUrl,
            headers: {
                authorization: getKinveyAuth(),
            }
        })
            .then(successGet)
            .catch(errorHandler);

        function successGet(response) {
            displayBooks(response);
        }
    }

    function getBookForEdit(book) {
        $.ajax({
            method: 'GET',
            url: appUrl + '/' + book._id,
            headers: {
                authorization: getKinveyAuth(),
            }
        })
            .then(successIdGet)
            .catch(errorHandler);

        function successIdGet(response) {
            $('#formEditBook input[name=id]').val(response._id);
            $('#formEditBook input[name=title]').val(response.title);
            $('#formEditBook input[name=author]').val(response.title);
            $('#formEditBook textarea[name=description]').val(response.description);
            manageView('viewEditBook')
        }
    }

    function deleteBook(book) {
        $.ajax({
            method: 'DELETE',
            url: appUrl + '/' + book._id,
            headers: {
                authorization: getKinveyAuth(),
            }
        })
            .then(successDelete)
            .catch(errorHandler);

        function successDelete() {
            getBooks()
        }
    }

    //  PRINTING DOM

    function displayBooks(response) {
        $('#books').empty();
        manageView('viewBooks');

        let table = $('<table>');
        let headings = $('<tr>');
        headings
            .append($('<th>').text('Title'))
            .append($('<th>').text('Author'))
            .append($('<th>').text('Description'))
            .append($('<th>').text('Actions'));
        headings.appendTo(table);

        for (let book of response) {
            let row = $('<tr>');
            let links = $('<td>');

            if (book._acl.creator == getUserId()) {
                let btnDelete = $('<button>').text('Delete').click(() => deleteBook(book));
                let btnEdit = $('<button>').text('Edit').click(() => getBookForEdit(book));
                links
                    .append(btnEdit)
                    .append(' ')
                    .append(btnDelete);
            }
            row
                .append($('<td>').text(book.title))
                .append($('<td>').text(book.author))
                .append($('<td>').text(book.description))
                .append(links);

            row.appendTo(table);
        }
        table.appendTo($('#books'));
    }

    //  HELPERS

    function manageMenuLinks() {
        if (sessionStorage.getItem('authToken')) {
            $('#linkHome').show();
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkListBooks').show();
            $('#linkCreateBook').show();
            $('#linkLogout').show();
        } else {
            $('#linkHome').show();
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkListBooks').hide();
            $('#linkCreateBook').hide();
            $('#linkLogout').hide();
        }
    }

    function manageView(view) {
        $('main section').hide();
        $('#' + view).show();
    }

    function saveSessionStorage(response) {
        sessionStorage.setItem('authToken', response._kmd.authtoken);
        sessionStorage.setItem('userId', response._id);
        sessionStorage.setItem('username', response.username);

        $('#loggedInUser').text('Hello' + sessionStorage.getItem('username'));
    }

    function getKinveyAuth() {
        return 'Kinvey ' + sessionStorage.getItem('authToken');
    }

    function getUserId() {
        return sessionStorage.getItem('userId');
    }

    function clearForms() {
        $('form').trigger('reset');
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