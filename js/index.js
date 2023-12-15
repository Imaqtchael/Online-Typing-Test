function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let wordButton = document.querySelector("label[for='word']");
let icon = wordButton.firstElementChild;

function generateParagraph() {
    wordButton.textContent = " sentences";
    wordButton.insertBefore(icon, wordButton.firstChild);

    let words = document.querySelector("#words-input").value;
    $.get("//metaphorpsum.com/paragraphs/1/" + words + "/", function(result) {
        toBeTyped = result;
        toBeTypedWordCount = toBeTyped.split(" ").length;

        let wordTotalSpan = document.querySelector("#word-total");
        wordTotalSpan.textContent = toBeTypedWordCount;

        let textarea = document.querySelector("textarea");
        textarea.value = toBeTyped;
        resetTypingTest();
    });
}

function generateRandom() {
    wordButton.textContent = " words";
    wordButton.insertBefore(icon, wordButton.firstChild);

    let words = parseInt(document.querySelector("#words-input").value);
    $.get("https://random-word-api.herokuapp.com/word?number=" + words, function(result) {
        toBeTyped = result.join(" ");
        toBeTypedWordCount = toBeTyped.split(" ").length;

        let wordTotalSpan = document.querySelector("#word-total");
        wordTotalSpan.textContent = toBeTypedWordCount;

        let textarea = document.querySelector("textarea")
        textarea.value = toBeTyped;
        resetTypingTest();
    });
}

function showTypingTest() {
    typingTestBody.style.display = "flex";
    historyBody.style.display = "none";

    textarea.focus();
}

function showHistory() {
    historyBody.style.display = "flex";
    typingTestBody.style.display = "none";
}

function generateNewTypingTest() {
    let activeRadioButton = document.querySelector("input[name='mode']:checked");
    if (activeRadioButton.value == "paragraph") {
        generateParagraph();
    } else {
        generateRandom();
    }
}

function startTimer() {
    secondsPassedCounter = setInterval(() => {
        secondsPassed += .1;
    }, 100);
}

function stopTimer() {
    clearInterval(secondsPassedCounter);
}

function resetTypingTest() {
    userInput = "";
    correctInput = 0;
    wrongInput = 0;
    totalWrongInput = 0;
    typingFinished = false;
    startedTyping = false;
    secondsPassed = 0;
    stopTimer();
    wordCount.textContent = 0;
    textarea.style.caretColor = "var(--tertiary-color)";
    textarea.previousSibling.innerHTML = "";

    textarea.selectionEnd = 0;
    textarea.selectionStart = 0;

    $("textarea").highlightWithinTextarea({
        highlight: [{
            highlight: correctInput > 0 ? [0, correctInput] : null,
            className: "correct"
        }, {
            highlight: wrongInput > 0 ? [correctInput, correctInput + wrongInput] : null,
            className: "wrong"
        }, {
            highlight: [correctInput + wrongInput, toBeTyped.length],
            className: "default"
        }]
    })

    textarea.blur();
    textarea.focus();
    hideWPMAccuracy();
}

function showWPMAccuracy() {
    accuracyText.parentElement.style.display = "block";
    wpmText.parentElement.style.display = "block";
}

function hideWPMAccuracy() {
    accuracyText.parentElement.style.display = "none";
    wpmText.parentElement.style.display = "none";
}

let showTypingTestButton = document.querySelector("#typing-test");
let showHistoryButton = document.querySelector("#history");
let typingTestBody = document.querySelector("#body");
let historyBody = document.querySelector("#history-body");

showTypingTestButton.addEventListener("click", showTypingTest);
showHistoryButton.addEventListener("click", showHistory);

let paragraphButton = document.querySelector("#paragraph");
paragraphButton.addEventListener("click", generateParagraph);

let randomButton = document.querySelector("#random");
randomButton.addEventListener("click", generateRandom);

let wordsCountButton = document.querySelector("#words-input");
wordsCountButton.addEventListener("keypress", (event) => {
    if (event.keyCode === 13) {
        generateNewTypingTest();
    }
})

let paragraph = document.querySelector(".paragraph");
paragraph.addEventListener("click", () => {
    textarea.focus();
});

let nextButton = document.querySelector("#next-button");
nextButton.addEventListener("keydown", event => {
    event.preventDefault();
    if (event.key == "Enter") {
        generateNewTypingTest();
    } else if (event.key == "Tab") {
        document.querySelector("#restart-button").focus();
    }
});
nextButton.addEventListener("click", generateNewTypingTest);

let restartButton = document.querySelector("#restart-button");
restartButton.addEventListener("keydown", event => {
    event.preventDefault();
    if (event.key == "Enter") {
        resetTypingTest();
    }
});
restartButton.addEventListener("click", resetTypingTest);

// Typing Text Logic

let userInput = "";
let toBeTyped = "";
let toBeTypedWordCount = 0;
let correctInput = 0;
let wrongInput = 0;
let totalWrongInput = 0;
let accuracyList = [];
let accuracyListTries = [];
let wpmList = [];
let wpmListTries = [];
let oneTimeWrongInput = 0;
let typingFinished = false;
let startedTyping = false;
let secondsPassed = 0;
let secondsPassedCounter;
let wordCount = document.querySelector("#typed-word");
let accuracyText = document.querySelector("#accuracy-text");
let wpmText = document.querySelector("#wpm-text");
let textarea = document.querySelector("textarea");
textarea.addEventListener("mousedown", function(event) {
    event.preventDefault();
});
textarea.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});
textarea.addEventListener("keydown", function(event) {
    event.preventDefault();
    if (event.key == "Tab") {
        document.querySelector("#next-button").focus();
        return;
    }
    if (typingFinished || event.key == "Shift") {
        return;
    }

    if (!startedTyping) {
        startedTyping = true;
        startTimer();
    }

    if (event.key == "Backspace") {
        if (userInput.length == 0) {
            return;
        }
        userInput = userInput.slice(0, -1);

        if (wrongInput > 0) {
            wrongInput -= 1;
        } else {
            correctInput -= 1;
        }
    } else {
        userInput += event.key;
        if (userInput[userInput.length - 1] == toBeTyped[userInput.length - 1] && wrongInput == 0) {
            correctInput += 1;
            textarea.style.caretColor = "var(--tertiary-color)";
        } else {
            wrongInput += 1;
            totalWrongInput += 1;
            textarea.style.caretColor = "red";
        }
    }

    let cursorPosition = userInput.length;
    textarea.selectionEnd = cursorPosition;
    textarea.selectionStart = cursorPosition;

    $("textarea").highlightWithinTextarea({
        highlight: [{
            highlight: correctInput > 0 ? [0, correctInput] : null,
            className: "correct"
        }, {
            highlight: wrongInput > 0 ? [correctInput, correctInput + wrongInput] : null,
            className: "wrong"
        }, {
            highlight: [correctInput + wrongInput, toBeTyped.length],
            className: "default"
        }]
    })

    let typedWords = userInput.split(" ").length - 1;
    if (userInput == toBeTyped) {
        typingFinished = true;
        startedTyping = false;
        stopTimer();
        wordCount.textContent = userInput.split(" ").length;

        let accuracy = totalWrongInput == 0 ? 100 : Math.floor(((toBeTyped.length - totalWrongInput) / toBeTyped.length) * 100);
        let wpm = Math.floor((toBeTyped.length / 5) * (60 / secondsPassed));

        accuracyText.textContent = accuracy;
        wpmText.textContent = wpm;
        showWPMAccuracy();

        accuracyList.push(accuracy);
        accuracyListTries.push(accuracyList.length);
        wpmList.push(wpm);
        wpmListTries.push(wpmList.length);

        console.clear();
        console.log(accuracyList, accuracyListTries);
        console.log(wpmList, wpmListTries);

        wpmChart.update();
        accuracyChart.update();
    } else {
        wordCount.textContent = typedWords;
    }

    textarea.blur();
    textarea.focus();
});

generateParagraph();