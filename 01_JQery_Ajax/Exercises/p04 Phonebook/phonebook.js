function attachEvents() {
    let baseUrl = 'https://phonebook-nakov.firebaseio.com/phonebook';
    let btnLoad = $('#btnLoad').click(loadContacts);
    let btnCreate = $('#btnCreate').click(createContact);
    let phonebook = $('#phonebook');

    function loadContacts() {
        $.get(baseUrl + '.json')
            .then(displayContacts)
            .catch(displayError);
    }

    function createContact() {
        let newPerson = $('#person').val();
        let newPhone = $('#phone').val();
        if (newPerson.length > 0 && newPhone.length > 0) {
            let newContact = {person: newPerson, phone: newPhone};
            $.ajax({
                url: `${baseUrl}.json`,
                method: 'POST',
                data: JSON.stringify(newContact),
                success: loadContacts,
                error: displayError
            });
            $('#person').val('');
            $('#phone').val('');
            loadContacts;
        }
    }

    function deleteContact(contact) {
        $.ajax({
            method: 'DELETE',
            url: `${baseUrl}/${contact}.json`,
            success: loadContacts,
            error: displayError
        })
    }

    function displayContacts(respond) {
        phonebook.empty();
        let keys = Object.keys(respond);

        for (let contact of keys) {
            let btnDelete = $('<button>').text('[Delete]').click(function() {deleteContact(contact)});
            let currContact = $('<li>').text(`${respond[contact].person}: ${respond[contact].phone} `)
            .append(btnDelete);
            phonebook.append(currContact);
        }
    }

    function displayError() {

    }
}