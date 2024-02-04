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
    let randomLength = getRandomInteger(4, 6);
    return new Promise(resolve => {
        $.get("https://random-word-api.herokuapp.com/word?lang=en&length=" + randomLength + "&number=" + words, function(data) {
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
    validateMinRandomWords();

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
    blurTyping();
    let activeRadioButton = document.querySelector("input[name='mode']:checked");
    if (activeRadioButton.value == "paragraph") {
        generateQuote();
    } else {
        generateRandom();
    }
}

let lastTypedLength = 0;

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

        if (lastTypedLength == input) {
            blurTyping();
        } else {
            lastTypedLength = input;
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(secondsPassedCounter);
}

function resetTypingTest() {
    blurTyping();

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
    currentMistakes.length = 0;
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
    logsChart.style.display = "grid";
    paragraph.style.display = "none";

    changeLogChartColor();
}

function showLogsTest() {
    currentRawWPM = [70, 86, 90];
    currentWPM = [60, 76, 80];
    currentMistakes = [{ x: 2, y: 3 }]
    currentTimeStamps = [1, 2, 3];

    accuracyText.textContent = 90;
    wpmText.textContent = 100;

    updateLogChart();
    showWPMAccuracy();
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

    let parent = document.querySelector("#test-chart");
    parent.removeChild(parent.lastElementChild);

    let logElement = document.createElement("canvas");
    logElement.id = "wpm_accuracy";
    parent.appendChild(logElement);

    logChart = new Chart("wpm_accuracy", { type: "line", data: logsChartDetails.data, options: logsChartDetails.options });
}

function validateMinRandomWords() {
    let activeRadioButton = document.querySelector("input[name='mode']:checked");

    if (activeRadioButton.value == "random" && wordsCountButton.value < 10) {
        wordsCountButton.value = 10;
    }
}

let gameSettings = document.querySelector(".game-settings");
let navButtons = document.querySelector(".nav-buttons");
let legends = document.querySelector(".legends");
let contacts = document.querySelector(".contacts");
let footer = document.querySelector("footer");

function focusTyping() {
    typingFocused = true;
    gameSettings.style.visibility = "hidden";
    navButtons.style.visibility = "hidden";
    legends.style.visibility = "hidden";
    contacts.style.visibility = "hidden";
    footer.style.visibility = "hidden";
}

function blurTyping() {
    typingFocused = false;
    gameSettings.style.visibility = "visible";
    navButtons.style.visibility = "visible";
    legends.style.visibility = "visible";
    contacts.style.visibility = "visible";
    footer.style.visibility = "visible";
}

function changeLogChartColor() {
    if (logChart) {
        logChart.data.datasets[0].borderColor = tertiaryColor;
        logChart.data.datasets[1].borderColor = headerColor;
        logChart.update();
    }

    if (historyLogChart) {
        historyLogChart.data.datasets[0].borderColor = headerColor;
        historyLogChart.data.datasets[1].borderColor = tertiaryColor;
        historyLogChart.update();
    }
}

let isDarkMode = true;
let primaryColor = "#323437";
let secondarColor = "#2c2e31";
let tertiaryColor = "#e2b714";
let textColor = "#646669";
let headerColor = "#d1d0c5";

function toggleLightMode() {
    primaryColor = "#e8e9ec";
    secondarColor = "#ccceda";
    tertiaryColor = "#2d539e";
    textColor = "#adb1c4";
    headerColor = "#33374c";

    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.documentElement.style.setProperty("--secondary-color", secondarColor);
    document.documentElement.style.setProperty("--tertiary-color", tertiaryColor);
    document.documentElement.style.setProperty("--text-color", textColor);
    document.documentElement.style.setProperty("--header-color", headerColor);

    toggleThemeButton.firstElementChild.classList.remove("fa-moon");
    toggleThemeButton.firstElementChild.classList.add("fa-snowflake");

    changeLogChartColor()
}

function toggleDarkMode() {
    primaryColor = "#323437";
    secondarColor = "#2c2e31";
    tertiaryColor = "#e2b714";
    textColor = "#646669";
    headerColor = "#d1d0c5";

    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.documentElement.style.setProperty("--secondary-color", secondarColor);
    document.documentElement.style.setProperty("--tertiary-color", tertiaryColor);
    document.documentElement.style.setProperty("--text-color", textColor);
    document.documentElement.style.setProperty("--header-color", headerColor);

    toggleThemeButton.firstElementChild.classList.remove("fa-snowflake");
    toggleThemeButton.firstElementChild.classList.add("fa-moon");

    changeLogChartColor()
}

function toggleTheme() {
    if (isDarkMode) {
        isDarkMode = false;
        toggleLightMode();
    } else {
        isDarkMode = true;
        toggleDarkMode();
    }
}

let toggleThemeButton = document.querySelector("#theme");
let showTypingTestButton = document.querySelector("#typing-test");
let showHistoryButton = document.querySelector("#history");
let showMultiplayerButton = document.querySelector("#multiplayer");
let typingTestBody = document.querySelector("#body");
let historyBody = document.querySelector("#history-body");
let multiplayerBody = document.querySelector("#multiplayer-body");

toggleThemeButton.addEventListener("click", toggleTheme);

showTypingTestButton.addEventListener("click", showTypingTest);
showHistoryButton.addEventListener("click", showHistory);

let paragraphButton = document.querySelector("#paragraph");
paragraphButton.addEventListener("click", () => {
    wordsCountButton.value = parseInt(paragraphButton.getAttribute('data-title'));
    generateQuote();
});

let randomButton = document.querySelector("#random");
randomButton.addEventListener("click", () => {
    paragraphButton.setAttribute('data-title', wordsCountButton.value);

    generateRandom();
});

let wordsCountButton = document.querySelector("#words-input");
wordsCountButton.addEventListener("keydown", (event) => {
    validateMinRandomWords();

    if (event.key == "Enter" || event.key == "Return") {
        let activeRadioButton = document.querySelector("input[name='mode']:checked");
        if (activeRadioButton.value == "paragraph") {
            paragraphButton.setAttribute("data-default", paragraphButton.value);
        }

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

let typingFocused = false;
let logChart;
let userInput = "";
let toBeTyped = "";
let toBeTypedWordCount = 0;
let input = 0;
let correctInput = 0;
let wrongInput = 0;
let totalWrongInput = 0;
let accuracyList = [];
let wpmList = [];
let logTries = [];
let currentWPM = [];
let currentRawWPM = [];
let currentTimeStamps = [];
let currentMistakes = [];
// let currentRawWPM = [70, 86, 90];
// let currentWPM = [60, 76, 80];
// let currentMistakes = [{ x: 2, y: 3 }]
// let currentTimeStamps = [1, 2, 3];
let oneTimeWrongInput = 0;
let typingFinished = false;
let startedTyping = false;
let secondsPassed = 0;
let secondsPassedCounter;
let wordCount = document.querySelector("#typed-word");
let accuracyText = document.querySelector("#accuracy-text");
let averageAccuracyText = document.querySelector("#average-accuracy-text");
let wpmText = document.querySelector("#wpm-text");
let averageWPMText = document.querySelector("#average-wpm-text");
let logsChart = document.querySelector(".test-logs");
let textarea = document.querySelector("textarea");
let logsChartDetails = {
    type: "line",
    data: {
        labels: currentTimeStamps,
        datasets: [{
            label: "wpm",
            fill: true,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            borderColor: tertiaryColor,
            pointRadius: 2,
            pointHoverRadius: 4,
            pointBackgroundColor: function(context) {
                let maximumValueIndex = context.dataset.data.indexOf(Math.max(...context.dataset.data));
                let minimumValueIndex = context.dataset.data.indexOf(Math.min(...context.dataset.data));
                let index = context.dataIndex;
                return maximumValueIndex == index ? "red" : minimumValueIndex == index ? "rgb(100, 102, 105, 1.0)" : tertiaryColor;
            },
            tension: 0.3,
            data: currentWPM
        }, {
            label: "raw",
            fill: true,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            borderColor: headerColor,
            pointRadius: 2,
            pointHoverRadius: 4,
            pointBackgroundColor: function(context) {
                let maximumValueIndex = context.dataset.data.indexOf(Math.max(...context.dataset.data));
                let minimumValueIndex = context.dataset.data.indexOf(Math.min(...context.dataset.data));
                let index = context.dataIndex;
                return maximumValueIndex == index ? "red" : minimumValueIndex == index ? "rgb(100, 102, 105, 1.0)" : headerColor;
            },
            tension: 0.3,
            data: currentRawWPM
        }, {
            type: "scatter",
            label: "errors",
            borderColor: function(context) {
                let index = context.dataIndex;
                let value = context.dataset.data[index];
                return value == 0 ? "transparent" : '#ff7d7d';
            },
            borderWidth: 1.5,
            pointStyle: "crossRot",
            pointRadius: 3,
            pointHoverRadius: 5,
            yAxisID: 'error',
            data: currentMistakes
        }]
    },
    options: {
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                },
                suggestedMin: 0
            },
            y: {
                title: {
                    display: true,
                    text: "words per minute",
                    font: {
                        size: 14,
                        lineHeight: 1.2,
                        style: 'normal'
                    }
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 4
                }
            },
            error: {
                title: {
                    display: true,
                    text: "errors",
                    font: {
                        size: 14,
                        lineHeight: 1.2,
                        style: 'normal'
                    }
                },
                type: "linear",
                display: true,
                position: "right",
                grid: {
                    drawOnChartArea: false
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 4
                },
                min: 0
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        hover: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        }
    }
};

function handleUserInput(uInput) {
    if (uInput == "Tab") {
        document.querySelector("#next-button").focus();
        return;
    }

    if ((userInput.length == toBeTyped.length && !typingFinished && uInput != "Backspace") || typingFinished || !/^[a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\-\+\=\{\[\}\]\|\\\:\;\"\'\<\,\>\.\?\/ ]$/.test(uInput) && uInput != "Backspace") {
        return;
    }

    if (!typingFocused) {
        focusTyping();
    }

    input += 1;

    if (!startedTyping) {
        startedTyping = true;
        startTimer();

        let wpm = Math.floor((correctInput / 5) * (60 / 1));
        let raw = Math.floor((input / 5) * (60 / 1));
        currentWPM.push(wpm);
        currentRawWPM.push(raw);
        currentTimeStamps.push(0);
    }

    if (uInput == "Backspace") {
        if (userInput.length == 0) {
            return;
        }
        userInput = userInput.slice(0, -1);

        if (wrongInput > 0) {
            wrongInput -= 1;

            if (wrongInput == 0) {
                textarea.style.caretColor = "var(--tertiary-color)";
            }
        } else {
            correctInput -= 1;
        }
    } else {
        userInput += uInput;
        if (userInput[userInput.length - 1] == toBeTyped[userInput.length - 1] && wrongInput == 0) {
            correctInput += 1;
            textarea.style.caretColor = "var(--tertiary-color)";
        } else {
            wrongInput += 1;
            totalWrongInput += 1;
            textarea.style.caretColor = "var(--wrong-color)";

            let index = Object.keys(currentMistakes).findIndex(key => currentMistakes[key].x == secondsPassed);
            if (index != -1) {
                currentMistakes[index].y = wrongInput;
            } else {
                currentMistakes.push({ x: secondsPassed, y: wrongInput })
            }
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
        blurTyping();
        typingFinished = true;
        startedTyping = false;
        stopTimer();
        wordCount.textContent = userInput.split(" ").length;

        let accuracy = totalWrongInput == 0 ? 100 : Math.floor(((toBeTyped.length - totalWrongInput) / toBeTyped.length) * 100);
        let wpm = Math.floor((toBeTyped.length / 5) * (60 / secondsPassed));
        let raw = Math.floor((input / 5) * (60 / secondsPassed))

        accuracyText.textContent = accuracy;
        wpmText.textContent = wpm;

        accuracyList.push(accuracy);
        wpmList.push(wpm);
        logTries.push(accuracyList.length);

        let averageAccuracy = accuracyList.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
        }, 0) / accuracyList.length;

        let averageWPM = wpmList.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
        }, 0) / wpmList.length;

        averageAccuracyText.textContent = Math.round(averageAccuracy);
        averageWPMText.textContent = Math.round(averageWPM);

        currentRawWPM.push(raw);
        currentWPM.push(wpm);
        currentTimeStamps.push((currentTimeStamps.length - 1) + 1);

        historyLogChart.update();
        updateLogChart();

        showWPMAccuracy();
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
}

textarea.addEventListener("mousedown", function(event) {
    event.preventDefault();
});
textarea.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});
textarea.addEventListener("keypress", function(event) {
    event.preventDefault();
});
textarea.addEventListener("keyup", function(event) {
    event.preventDefault();
});
textarea.addEventListener("input", function(event) {
    textarea.value = toBeTyped;
    handleUserInput(event.inputType == "deleteContentBackward" ? "Backspace" : event.data);
    event.preventDefault();
});
textarea.addEventListener("keydown", function(event) {
    if (event.key == "Unidentified") return;
    handleUserInput(event.key);
    event.preventDefault();
});

let urlParams = new URLSearchParams(window.location.search);
if (!urlParams.has("code")) {
    generateQuote();
    // showHistory();
    // showLogsTest();
}