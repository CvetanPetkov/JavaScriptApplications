function attachEvents() {
    const appKey = 'kid_BJXTsSi-e';
    const baseUrl = `https://baas.kinvey.com/appdata/${appKey}/students/`;
    const username = 'guest';
    const password = 'guest';
    const authHeaders = {
        'Authorization': 'Basic ' + btoa(username + ':' + password),
        'Content-Type': 'application/json'
    };
    let table = $('#results');
    let btnAdd = $('#btnAdd').click(addStudent);

    loadStudents();

    function loadStudents() {
        $.ajax({
            url: baseUrl,
            method: 'GET',
            headers: authHeaders
        })
            .then(printStudents)
            .catch(displayError);
    }

    function printStudents(respond) {
        table.find('.entry').remove();

        let students = Array.from(respond);
        students = students.sort((a, b) => a.ID - b.ID);

        for (let student of students) {
            let tr = $('<tr>').addClass('entry');
            tr
                .append($('<td>').text(student.ID))
                .append($('<td>').text(student.FirstName))
                .append($('<td>').text(student.LastName))
                .append($('<td>').text(student.FacultyNumber))
                .append($('<td>').text(student.Grade));
            table.append(tr);
        }
    }

    function addStudent() {
        let id = $('#id');
        let firstName = $('#firstName');
        let lastName = $('#lastName');
        let facultyNumb = $('#facultyNumber');
        let grade = $('#grade');
        let data;

        if (id.val() !== ''
            && firstName.val() !== ''
            && lastName.val() !== ''
            && facultyNumb.val() !== ''
            && grade.val() !== '') {

            data = JSON.stringify({
                ID: Number(id.val().trim()),
                FirstName: firstName.val().trim(),
                LastName: lastName.val().trim(),
                FacultyNumber: facultyNumb.val().trim(),
                Grade: Number(grade.val().trim())
            });

            $.ajax({
                url: baseUrl,
                method: 'POST',
                headers: authHeaders,
                data: data
            })
                .then(loadStudents)
                .catch(displayError);
        }

        id.val('');
        firstName.val('');
        lastName.val('');
        facultyNumb.val('');
        grade.val('');
    }

    function displayError(err) {
        console.log(err);
    }
}