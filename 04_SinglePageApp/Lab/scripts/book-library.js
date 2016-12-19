function startApp() {
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_H18cbsb7x';
    const appSecret = '258d0964ff0c4680a20812025fb00369';
    const authHeaders = {
        'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret),
        'content-type': 'application/json'
    };

    sessionStorage.clear();
    showHideMenuLinks();
    showView('viewHome');

    $('#linkHome').click(showHomeView);         //  BIND NAVIGATION LINKS
    $('#linkLogin').click(showLoginView);
    $('#linkRegister').click(showRegisterView);
    $('#linkListBooks').click(listBooks);
    $('#linkCreateBook').click(showCreateBookView);
    $('#linkLogout').click(logoutUser);

    $('#formLogin').submit(loginUser);          //  BIND SUBMIT ACTIONS
    $('#formRegister').submit(registerUser);
    $('#formCreateBook').submit(createBook);
    $('#formEditBook').submit(editBook);

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

    function showHideMenuLinks() {
        $('#linkHome').show();
        if (sessionStorage.getItem('authToken')) {
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkListBooks').show();
            $('#linkCreateBook').show();
            $('#linkLogout').show();
        } else {
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkListBooks').hide();
            $('#linkCreateBook').hide();
            $('#linkLogout').hide();
        }
    }

    function showView(viewName) {
        $('main > section').hide();
        $('#' + viewName).show();
    }

    function showHomeView() {
        showView('viewHome');
    }

    function showLoginView() {
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }

    function showRegisterView() {
        showView('viewRegister');
        $('#formRegister').trigger('reset');
    }

    function showCreateBookView() {
        showView('viewCreateBook');
        $('#formCreateBook').trigger('reset');
    }

    function registerUser() {
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=password]').val()
        };
        $.ajax({
            method: 'POST',
            url: baseUrl + 'user/' + appKey,
            headers: authHeaders,
            data: JSON.stringify(userData)
        })
            .then(registerSuccess)
            .catch(errorHandler);

        function registerSuccess(respond) {
            saveSessionAuth(respond);
            showHideMenuLinks();
            listBooks();
            showInfo('User registration successful');
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
            headers: authHeaders,
            data: JSON.stringify(userData)
        })
            .then(loginSuccess)
            .catch(errorHandler);
        
        function loginSuccess(userInfo) {
            saveSessionAuth(userInfo);
            showHideMenuLinks();
            listBooks();
            showInfo('Login successful');
        }
    }

    function logoutUser() {
        sessionStorage.clear();
        $('#loggedInUser').text('');
        showHideMenuLinks();
        showView('viewHome');
        showInfo('Logout successful.');
    }

    function listBooks() {
        $('#books').empty();
        showView('viewBooks');

        $.ajax({
            method: 'GET',
            url: baseUrl + 'appdata/' + appKey + '/booksApp',
            headers: getUserAuthHeaders()
        })
            .then(loadBooksSuccess)
            .catch(errorHandler);

        function loadBooksSuccess(books) {
            showInfo('Books loaded.');
            if (books.length == 0) {
                $('#books').text('No books in the library.');
            } else {
                let booksTable = $('<table>')
                    .append($('<tr>')
                        .append('<th>Title</th><th>Author</th><th>Description</th><th>Actions</th>'));
                for (let book of books) {
                    appendBookRow(book, booksTable);
                    $('#books').append(booksTable);
                }
            }
        }

        function loadBookForEdit(book) {
            $.ajax({
                method: 'GET',
                url: baseUrl + 'appdata/' + appKey + '/booksApp/' + book._id,
                headers: getUserAuthHeaders(),
            })
                .then(loadBookForEditSuccess)
                .catch(errorHandler);
        }

        function loadBookForEditSuccess(book) {
            $('#formEditBook input[name=id]').val(book._id);
            $('#formEditBook input[name=title]').val(book.title);
            $('#formEditBook input[name=author]').val(book.author);
            $('#formEditbook textarea[name=description]').val(book.description);
            showView('viewEditBook');
        }

        function appendBookRow(book, booksTable) {
            let links = [];
            if (book._acl.creator == sessionStorage['userId']) {
                let deleteLink = $('<a href="#">[Delete]</a>')
                    .click(deleteBook.bind(this, book));
                let editLink = $('<a href="#">[Edit]</a>')
                    .click(loadBookForEdit.bind(this, book));
                links = [deleteLink, ' ', editLink];
            }

            booksTable.append($('<tr>').append(
                $('<td>').text(book.title),
                $('<td>').text(book.author),
                $('<td>').text(book.description),
                $('<td>').append(links)
            ));
        }
    }

    function createBook() {
        let bookData = {
            title: $('#formCreateBook input[name=title]').val(),
            author: $('#formCreateBook input[name=author]').val(),
            description: $('#formCreateBook textarea[name=description]').val()
        };

        $.ajax({
            method: 'POST',
            url: baseUrl + 'appdata/' + appKey + '/booksApp',
            headers: getUserAuthHeaders(),
            data: bookData
        })
            .then(createBookSuccess)
            .catch(errorHandler);

        function createBookSuccess(response) {
            listBooks();
            showInfo('Book created.');
        }
    }

    function editBook() {
        let bookData = {
            title: $('#formEditBook input[name=title]').val(),
            author: $('#formEditBook input[name=author]').val(),
            description: $('#formEditBook textarea[name=description]').val()
        };

        $.ajax({
            method: 'PUT',
            url: baseUrl + 'appdata/' + appKey + '/booksApp/' + $('#formEditBook input[name=id]').val(),
            headers: getUserAuthHeaders(),
            data: bookData
        })
            .then(editBookSuccess)
            .catch(errorHandler);

        function editBookSuccess() {
            listBooks();
            showInfo('Book edited.');
        }
    }

    function deleteBook(book) {
        $.ajax({
            method: 'DELETE',
            url: baseUrl + 'appdata/' + appKey + '/booksApp/' + book._id,
            headers: getUserAuthHeaders(),
        })
            .then(deleteBookSuccess)
            .catch(errorHandler);

        function deleteBookSuccess(response) {
            listBooks();
            showInfo('Book deleted.');
        }
    }

    function saveSessionAuth(respond) {
        let userAuth = respond._kmd.authtoken;
        let userId = respond._id;
        let userName = respond.username;

        sessionStorage.setItem('authToken', userAuth);
        sessionStorage.setItem('userId', userId);
        $('#loggedInUser').text('Welcome, ' + userName + '!');
    }

    function getUserAuthHeaders() {
        return {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        };
    }

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function () {
            $('#infoBox').fadeOut();
        }, 3000);
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