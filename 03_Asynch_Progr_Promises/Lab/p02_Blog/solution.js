function attachEvents() {
    const appId = 'kid_r10vdvOGe';
    const apiUrl = 'https://baas.kinvey.com/appdata/' + appId;
    const appUsername = 'admin';
    const appPassword = 'admin';
    const base64auth = btoa(appUsername + ':' + appPassword);
    const authHeaders = {'Authorization': 'Basic ' + base64auth};

    $('#btnLoadPosts').click(loadPosts);
    $('#btnViewPost').click(viewPost);

    function loadPosts() {
        $.ajax({
            url: apiUrl + '/posts',
            method: 'GET',
            headers: authHeaders
        })
            .then(importPosts)
            .catch(displayError);
    }

    function viewPost() {
        let selectedPostId = $('#posts').val();
        if (!selectedPostId) { return; }

        let requestPost = $.ajax({
            url: apiUrl + '/posts/' + selectedPostId,
            method: 'GET',
            headers: authHeaders
        });
        let requestComments = $.ajax({
            url: apiUrl + `/comments/?query={"post_id":"${selectedPostId}"}`,
            method: 'GET',
            headers: authHeaders
        });
        Promise.all([requestPost, requestComments])
            .then(displayPostAndComments)
            .catch(displayError);
    }

    function importPosts(respond) {
        $('#posts').empty();
        for (let post of respond) {
            $('<option>')
                .val(post._id)
                .text(post.title)
                .appendTo('#posts');
        }
    }
    function displayPostAndComments([post, comments]) {
        $('#post-title').text(post.title);
        $('#post-body').text(post.body);
        $('#post-comments').empty();

        for (let comment of comments) {
            $('<li>')
                .text(comment.text)
                .appendTo($('#post-comments'));
        }
    }

    function displayError(err) {
        let errorDiv = $('<div>');
        errorDiv.text(`Error: ${err.status} (${err.statusText})`)
            .prependTo(document.body);
        setTimeout(function () {
            $(errorDiv).fadeOut(function () {
                $(errorDiv).remove();
            });
        }, 3000);
    }
}