function attachEvents() {
    const appUrl = 'https://baas.kinvey.com/appdata/kid_H14VpnYMl/biggestCatches';
    const base64auth = btoa('admin:admin');
    const authorizationHeader = {'Authorization': 'Basic ' + base64auth};

    $('.add').click(addCatch);
    $('.load').click(loadCatches);

    function addCatch() {
        let data = parseForm('#addForm');
        $.ajax({
            url: appUrl,
            method: 'POST',
            headers: authorizationHeader,
            data,
            contentType: 'application/json'
        })
            .then(emptyAddForm)
            .catch(displayError);
    }

    function loadCatches() {
        $.ajax({
            url: appUrl,
            method: 'GET',
            headers: authorizationHeader
        })
            .then(displayCatches)
            .catch(displayError);
    }

    function updateCatch(id) {
        let data = parseForm(id);
        $.ajax({
            url: appUrl + '/' + id,
            method: 'PUT',
            headers: authorizationHeader,
            data: data,
            contentType: 'applications/json'
        })
            .then(displayCatches)
            .catch(displayError);
    }

    function deleteCatch(id) {
        $.ajax({
            url: appUrl + '/' + id,
            method: 'DELETE',
            headers: authorizationHeader
        })
            .then(loadCatches)
            .catch(displayError);
    }

    function displayCatches(respond) {
        $('#catches').empty();

        for (let item of respond) {
            let id = item._id;
            let angler = item.angler;
            let weight = item.weight;
            let species = item.species;
            let location = item.location;
            let bait = item.bait;
            let captureTime = item.captureTime;

            let container = $('<div>').addClass('catch').attr('data-id', id);
            container
                .append($('<label>').text('Angler'))
                .append($('<input>').addClass('angler').attr('type', 'text').val(angler))
                .append($('<label>').text('Weight'))
                .append($('<input>').addClass('weight').attr('type', 'text').val(weight))
                .append($('<label>').text('Species'))
                .append($('<input>').addClass('species').attr('type', 'text').val(species))
                .append($('<label>').text('Location'))
                .append($('<input>').addClass('location').attr('type', 'text').val(location))
                .append($('<label>').text('Bait'))
                .append($('<input>').addClass('bait').attr('type', 'text').val(bait))
                .append($('<label>').text('Capture Time'))
                .append($('<input>').addClass('captureTime').attr('type', 'text').val(captureTime))
                .append($('<button>').addClass('update').text('Update').on('click', () => updateCatch(id)))
                .append($('<button>').addClass('delete').text('Delete').on('click', () => deleteCatch(id)));

            container.appendTo($('#catches'));
        }
    }

    function emptyAddForm() {
        console.log('empty');
        $('#addform').find('.angler').val('2111');
        $('#addform').find('.weight').val('');
        $('#addform').find('.species').val('');
        $('#addform').find('.location').val('');
        $('#addform').find('.bait').val('');
        $('#addform').find('.captureTime').val('');
    }

    function displayError(err) {
        console.log(err);
    }

    function parseForm(selector) {
        if (selector.length > 10) {
            selector = $('#catches').find('[data-id="' + selector + '"]');
        }
        let angler = $(selector).find('.angler').val().trim();
        let weight = $(selector).find('.weight').val().trim();
        let species = $(selector).find('.species').val().trim();
        let location = $(selector).find('.location').val().trim();
        let bait = $(selector).find('.bait').val().trim();
        let captureTime = $(selector).find('.captureTime').val().trim();
        weight = Number(weight);
        captureTime = Number(captureTime);

        if (angler != '' && weight != '' && species != ''
            && location != '' && bait != '' && captureTime != '') {
            return JSON.stringify({
                'angler': angler,
                'weight': weight,
                'species': species,
                'location': location,
                'bait': bait,
                'captureTime': captureTime
            });
        }
    }
}