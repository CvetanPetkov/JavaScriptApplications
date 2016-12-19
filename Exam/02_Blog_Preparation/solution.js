function attachEvents() {
    let baseUrl = 'https://baas.kinvey.com/';
    let appId = 'kid_HkyGBiYQe';
    let appSecret = 'bc12d0c6ffae4463bb5bccf3bfa1b769';
    let postsUrl = 'https://baas.kinvey.com/appdata/' + appId + '/posts';
    let commentsUrl = 'https://baas.kinvey.com/appdata/' + appId + '/comments';
    let username = 'a';
    let password = 'a';
    let basicAuth = 'Basic ' + btoa(appId + ':' + appSecret);
    let userAuth = 'Basic ' + btoa(username + ':' + password);

    $('#btnLoadPosts').click(loadPosts);
    $('#btnViewPost').click(viewPostsAndComments);


    function loadPosts() {
        $.ajax({
            method: 'GET',
            url: postsUrl,
            headers: {
                authorization: userAuth
            }
        })
            .then(successLoad)
            .catch(errorHandler);

        function successLoad(response) {
            $('#posts').empty();
            let select = $('#posts');

            for (let post of response) {
                let option = $('<option>').val(post._id).text(post.title);
                option.appendTo(select);
            }
        }
    }

    function viewPostsAndComments() {
        let selectedPostId = $('#posts').val();
        let requestComments = $.ajax({
            method: 'GET',
            url: commentsUrl + `/?query={"post_id":"${selectedPostId}"}`,
            headers: {
                authorization: userAuth
            }
        });
        let requestPosts = $.ajax({
            method: 'GET',
            url: postsUrl + '/' + selectedPostId,
            headers: {
                authorization: userAuth
            }
        });
        Promise.all([requestPosts, requestComments])
            .then(printPostsAndComments)
            .catch(errorHandler);

        function printPostsAndComments([post, comments]) {
            $('#post-title').text(post.title);
            $('#post-body').text(post.body);
            $('#post-comments').empty();

            for (let comment of comments) {
                $('<li>')
                    .text(comment.text)
                    .appendTo($('#post-comments'));
            }
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