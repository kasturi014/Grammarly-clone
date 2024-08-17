const charVal = document.getElementById('editableEditor');
const checkButton = document.getElementById('checkButton');
const copyButton = document.getElementById('copyButton');
const clearButton = document.getElementById('clearButton');
const totalCounter = document.getElementById('total-counter');
const remainingCounter = document.getElementById('remaining-counter');

checkButton.addEventListener('click', function() {
    checkGrammar();
});

copyButton.addEventListener('click', function() {
    document.execCommand('copy');
});

clearButton.addEventListener('click', function() {
    charVal.innerHTML = '';
    totalCounter.textContent = '0';
    remainingCounter.textContent = '150';
});

charVal.addEventListener('input', updateCounters);

function checkGrammar() {
    const apiUrl = 'https://api.languagetool.org/v2/check';
    const languageCode = 'en-US';
    const textToCheck = charVal.innerHTML;

    fetch(`${apiUrl}?text=${encodeURIComponent(textToCheck)}&language=${languageCode}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.matches && data.matches.length > 0) {
                const { message, replacements, correctedText } = applyCorrections(textToCheck, data.matches);
                const result = textToCheck.split(' ').map((word, index) => {
                    if (correctedText.split(' ')[index] !== word) {
                        return `<span class="correctionRequired">${word}<div class="correction-content"><a href="#">Correction: ${replacements[index]}</a><a href="#">${message[index]}</a></div></span>`;
                    } else {
                        return word;
                    }
                }).join(' ');
                charVal.innerHTML = result;
            } else {
                alert("No errors in your text!");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function applyCorrections(content, matches) {
    let editorText = content;
    let returnObj = {
        message: [],
        replacements: [],
        correctedText: '',
    }
    for (const match of matches) {
        const toBeModified = content.substring(match.offset, match.offset + match.length);
        returnObj.message.push(match.message);
        returnObj.replacements.push(match.replacements[0].value);
        editorText = editorText.replace(toBeModified, match.replacements[0].value);
        returnObj.correctedText = editorText;
    }
    return returnObj;
}

function updateCounters() {
    const text = charVal.innerText;
    const totalLength = text.length;
    const maxLength = 150; // Define your max length
    totalCounter.textContent = totalLength;
    remainingCounter.textContent = maxLength - totalLength;
}
