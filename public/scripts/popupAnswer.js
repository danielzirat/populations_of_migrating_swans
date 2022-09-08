const openPopupButtons = document.querySelectorAll('[data-popup-target]'); /* find by css selector */
const closePopupButtons = document.querySelectorAll('[data-close-button]');
const overlay = document.getElementById('overlay');
const submitButton = document.querySelector('[data-submit-answer]');

openPopupButtons?.forEach(button => {
    button.addEventListener('click', () => {
        const popup = document.querySelector(button.dataset.popupTarget)
        openPopup(popup)
    });
});

overlay?.addEventListener('click', () => {
    const popups = document.querySelectorAll('.popup.active');
    popups.forEach(popup => {
        closePopup(popup);
    });
});

closePopupButtons?.forEach(button => {
    button.addEventListener('click', () => {
        const popup = button.closest('.popup')
        closePopup(popup)
    });
});

submitButton?.addEventListener('click', () => {
    const element = document.querySelector('[data-answer]');
    if (element == null) {
        return;
    }
    const questionId = document.getElementsByClassName('question')[0].id;
    const answer = element.value;
    const data = {
        questionId: questionId,
        answer: answer
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(`/answer/new`, options)
        .then(value => value.json())
        .then(value => {
            if (!value.success) {
                if (value.redirect) {
                    window.location = value.redirect;
                    return;
                }
                alert('Something went wrong...!');
                return;
            }
            document.location.reload();
        })
        .catch(reason => {
            alert('An Error occurred: ' + reason);
        });
})

function openPopup(popup) {
    if (popup == null) {
        return;
    }
    popup.classList.add('active');
    overlay.classList.add('active');
}

function closePopup(popup) {
    if (popup == null) {
        return;
    }
    popup.classList.remove('active');
    overlay.classList.remove('active');
}