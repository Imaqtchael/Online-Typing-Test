function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let wordButton = document.querySelector("label[for='word']");
let icon = wordButton.firstElementChild;

function fetchQuote() {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'GET',
            url: 'https://api.api-ninjas.com/v1/quotes?',
            headers: { 'X-Api-Key': 'pETqGO2l1uJeufMoO6942w==KtfqSvf1pA6zVgC8' },
            contentType: 'application/json',
            success: function(result) {
                resolve(result[0].quote);
            },
            error: function ajaxError(jqXHR) {
                reject(jqXHR.responseText);
            }
        });
    });
}

function fetchRandom(words) {
    return new Promise(resolve => {
        $.get("https://random-word-api.herokuapp.com/word?number=" + words, function(data) {
            resolve(data);
        });
    });
}

async function generateQuote() {
    hideWPMAccuracy();
    showLoading();
    wordButton.textContent = " quotes";
    wordButton.insertBefore(icon, wordButton.firstChild);

    let words = document.querySelector("#words-input").value;
    let initial = [];
    for (let i = 0; i < words; i++) {
        let result = await fetchQuote();
        initial.push(result);
    }

    toBeTyped = initial.join(" ").trim();
    toBeTypedWordCount = toBeTyped.split(" ").length;

    let wordTotalSpan = document.querySelector("#word-total");
    wordTotalSpan.textContent = toBeTypedWordCount;

    let textarea = document.querySelector("textarea");
    textarea.value = toBeTyped;
    hideLoading();
    resetTypingTest();
    // $.get("//metaphorpsum.com/paragraphs/1/" + words + "/", function(result) {
    //     toBeTyped = result;
    //     toBeTypedWordCount = toBeTyped.split(" ").length;

    //     let wordTotalSpan = document.querySelector("#word-total");
    //     wordTotalSpan.textContent = toBeTypedWordCount;

    //     let textarea = document.querySelector("textarea");
    //     textarea.value = toBeTyped;
    //     resetTypingTest();
    // });
}

async function generateRandom() {
    hideWPMAccuracy();
    showLoading();
    wordButton.textContent = " words";
    wordButton.insertBefore(icon, wordButton.firstChild);

    let words = parseInt(document.querySelector("#words-input").value);
    toBeTyped = await fetchRandom(words);
    toBeTyped = toBeTyped.join(" ").trim();
    toBeTypedWordCount = toBeTyped.split(" ").length;

    let wordTotalSpan = document.querySelector("#word-total");
    wordTotalSpan.textContent = toBeTypedWordCount;

    let textarea = document.querySelector("textarea")
    textarea.value = toBeTyped;
    hideLoading();
    resetTypingTest();
}

function showLoading() {
    let paragraph = document.querySelector(".paragraph");
    paragraph.style.display = "none";
    let loading = document.querySelector("#loading");
    loading.style.display = "flex";
}

function hideLoading() {
    let paragraph = document.querySelector(".paragraph");
    paragraph.style.display = "flex";
    let loading = document.querySelector("#loading");
    loading.style.display = "none";
}

let activeNavButton = document.querySelector("nav button.active");

function showTypingTest() {
    if (activeNavButton) {
        activeNavButton.classList.remove("active");
    }

    activeNavButton = showTypingTestButton;
    activeNavButton.classList.add("active");

    typingTestBody.style.display = "flex";
    historyBody.style.display = "none";
    multiplayerBody.style.display = "none";

    if (textarea.offsetParent == null) {
        nextButton.focus();
    } else {
        textarea.focus();
    }
}

function showHistory() {
    if (activeNavButton) {
        activeNavButton.classList.remove("active");
    }

    activeNavButton = showHistoryButton;
    activeNavButton.classList.add("active");

    historyBody.style.display = "flex";
    typingTestBody.style.display = "none";
    multiplayerBody.style.display = "none";
}

function generateNewTypingTest() {
    let activeRadioButton = document.querySelector("input[name='mode']:checked");
    if (activeRadioButton.value == "paragraph") {
        generateQuote();
    } else {
        generateRandom();
    }
}

function startTimer() {
    secondsPassedCounter = setInterval(() => {
        secondsPassed += 1;

        let wpm = Math.floor((correctInput / 5) * (60 / secondsPassed));
        let raw = Math.floor((input / 5) * (60 / secondsPassed));
        currentWPM.push(wpm);
        currentRawWPM.push(raw);
        currentTimeStamps.push(secondsPassed);

        if (secondsPassed >= 300) {
            generateNewTypingTest();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(secondsPassedCounter);
}

function resetTypingTest() {
    userInput = "";
    input = 0;
    correctInput = 0;
    wrongInput = 0;
    totalWrongInput = 0;
    typingFinished = false;
    startedTyping = false;
    secondsPassed = 0;
    currentWPM.length = 0;
    currentRawWPM.length = 0;
    currentTimeStamps.length = 0;
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
    });

    textarea.blur();
    textarea.focus();
    hideWPMAccuracy();
}

function showWPMAccuracy() {
    accuracyText.parentElement.style.display = "block";
    wpmText.parentElement.style.display = "block";
    logsChart.style.display = "block";
    paragraph.style.display = "none";
}

function hideWPMAccuracy() {
    accuracyText.parentElement.style.display = "none";
    wpmText.parentElement.style.display = "none";
    logsChart.style.display = "none";
    paragraph.style.display = "flex";
}

function updateLogChart() {
    if (logChart) {
        logChart.destroy();
    }

    let parent = document.querySelector("#test-logs");
    parent.removeChild(parent.firstElementChild);

    let logElement = document.createElement("canvas");
    logElement.id = "wpm_accuracy";
    parent.appendChild(logElement);

    logChart = new Chart("wpm_accuracy", { type: "line", data: logsChartDetails.data, options: logsChartDetails.options });

}

let showTypingTestButton = document.querySelector("#typing-test");
let showHistoryButton = document.querySelector("#history");
let showMultiplayerButton = document.querySelector("#multiplayer");
let typingTestBody = document.querySelector("#body");
let historyBody = document.querySelector("#history-body");
let multiplayerBody = document.querySelector("#multiplayer-body");

showTypingTestButton.addEventListener("click", showTypingTest);
showHistoryButton.addEventListener("click", showHistory);

let paragraphButton = document.querySelector("#paragraph");
paragraphButton.addEventListener("click", generateQuote);

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

let logChart;
let userInput = "";
let toBeTyped = "";
let toBeTypedWordCount = 0;
let input = 0;
let correctInput = 0;
let wrongInput = 0;
let totalWrongInput = 0;
let accuracyList = [];
let accuracyListTries = [];
let wpmList = [];
let wpmListTries = [];
let currentWPM = [];
let currentRawWPM = [];
let currentTimeStamps = [];
let oneTimeWrongInput = 0;
let typingFinished = false;
let startedTyping = false;
let secondsPassed = 0;
let secondsPassedCounter;
let wordCount = document.querySelector("#typed-word");
let accuracyText = document.querySelector("#accuracy-text");
let wpmText = document.querySelector("#wpm-text");
let logsChart = document.querySelector("#test-logs");
let textarea = document.querySelector("textarea");
let logsChartDetails = {
    type: "line",
    data: {
        labels: currentTimeStamps,
        datasets: [{
            label: "wpm",
            fill: false,
            backgroundColor: "rgba(226, 183, 20, 1.0)",
            borderColor: "rgba(226, 183, 20, 0.5)",
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: function(context) {
                let maximumValueIndex = context.dataset.data.indexOf(Math.max(...context.dataset.data));
                let minimumValueIndex = context.dataset.data.indexOf(Math.min(...context.dataset.data));
                let index = context.dataIndex;
                return maximumValueIndex == index ? "red" : minimumValueIndex == index ? "rgb(100, 102, 105, 1.0)" : "rgb(226, 183, 20, 1.0)";
            },
            stepped: true,
            tension: 0.3,
            data: currentWPM
        }, {
            label: "raw",
            fill: false,
            backgroundColor: "rgba(209, 208, 197, 1.0)",
            borderColor: "rgba(209, 208, 197, 0.5)",
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: function(context) {
                let maximumValueIndex = context.dataset.data.indexOf(Math.max(...context.dataset.data));
                let minimumValueIndex = context.dataset.data.indexOf(Math.min(...context.dataset.data));
                let index = context.dataIndex;
                return maximumValueIndex == index ? "red" : minimumValueIndex == index ? "rgb(100, 102, 105, 1.0)" : "rgb(209, 208, 197, 1.0)";
            },
            stepped: true,
            tension: 0.3,
            data: currentRawWPM
        }]
    },
    options: {
        legend: {
            display: false
        },
        title: {
            display: false
        },
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            }]
        },
        tooltips: {
            mode: 'index',
            intersect: false
        },
        hover: {
            mode: 'index',
            intersect: false
        },
        responsive: true,
        maintainAspectRatio: true
    }
};

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

    if ((userInput.length == toBeTyped.length && !typingFinished && event.key != "Backspace") || typingFinished || ["Shift", "Enter", "Escape", "CapsLock", "Control", "Alt", "Meta", "ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(event.key)) {
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
            textarea.style.caretColor = "var(--tertiary-color)";
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

    if (userInput == toBeTyped) {
        typingFinished = true;
        startedTyping = false;
        stopTimer();
        wordCount.textContent = userInput.split(" ").length;

        let accuracy = totalWrongInput == 0 ? 100 : Math.floor(((toBeTyped.length - totalWrongInput) / toBeTyped.length) * 100);
        let wpm = Math.floor((toBeTyped.length / 5) * (60 / secondsPassed));
        let raw = Math.floor((input / 5) * (60 / secondsPassed))

        accuracyText.textContent = accuracy;
        wpmText.textContent = wpm;
        showWPMAccuracy();

        accuracyList.push(accuracy);
        accuracyListTries.push(accuracyList.length);
        wpmList.push(wpm);
        wpmListTries.push(wpmList.length);
        currentRawWPM.push(raw);

        currentWPM.push(wpm);
        currentTimeStamps.push((currentTimeStamps.length - 1) + 1)

        wpmChart.update();
        accuracyChart.update();
        updateLogChart();
    } else {
        let typedWords = userInput.split(" ").length - 1;
        wordCount.textContent = typedWords;
    }

    if (toBeTyped.length - userInput.length <= 40) {
        textarea.scrollTop = textarea.scrollHeight;
        textarea.focus();
    } else {
        textarea.blur();
        textarea.focus();
    }
    input += 1;
});

let urlParams = new URLSearchParams(window.location.search);
if (!urlParams.has("code")) {
    generateQuote();
}