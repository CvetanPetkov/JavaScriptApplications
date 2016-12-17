function attachEvents() {
    let baseUrl = 'https://messenger-5f41a.firebaseio.com/';
    let textArea = $('#messages');
    let btnSend = $('#submit');
    let btnRefresh = $('#refresh');

    btnSend.click(sendMessage);
    btnRefresh.click(displayMessages);

    function sendMessage() {
        let name = $('#author');
        let message = $('#content');
        if (name.val() != '' && message.val() != '') {
            let newMessage = {
                author: name.val(),
                content: message.val(),
                timestamp: Date.now()
            };

            $.ajax({
                url: `${baseUrl}.json`,
                method: 'POST',
                data: JSON.stringify(newMessage),
                success: displayMessages
            });
            name.val('');
            message.val('');
        }
    }

    function displayMessages() {
        $.ajax({
            url: `${baseUrl}.json`,
            method: 'GET',
            success: printMessages
        });
    }

    function printMessages(respond) {
        textArea.val('');
        let messages = Object.keys(respond);

        for (let id of messages) {
            let name = respond[id].author;
            let message = respond[id].content;

            textArea.val(function (i, oldText) {
                return oldText += `${name}: ${message}\n`
            });
        }
    }
}