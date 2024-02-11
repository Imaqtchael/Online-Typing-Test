function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readTextFile(file) {
    return new Promise((resolve) => {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    var allText = document.location.protocol == "https:" ? rawFile.responseText.split("\n") : rawFile.responseText.split("\r\n");
                    resolve(allText);
                }
            }
        }

        rawFile.send();
    });
}


async function fetchQuote(quotes) {
    let result = [];
    return new Promise(resolve => {
        for (let i = 0; i < quotes; i++) {
            let current = allQuotes[getRandomInteger(0, allQuotes.length - 1)].trim();
            result.push(current);
        }

        resolve(result);
    });

    // **************************************
    // If you want to use an API then comment the code above and uncomment the code below
    // **************************************

    // return new Promise((resolve, reject) => {
    //     $.ajax({
    //         method: 'GET',
    //         url: 'https://api.api-ninjas.com/v1/quotes?',
    //         headers: { 'X-Api-Key': '<YOUR API HERE>' },
    //         contentType: 'application/json',
    //         success: function(result) {
    //             resolve(result[0].quote);
    //         },
    //         error: function ajaxError(jqXHR) {
    //             reject(jqXHR.responseText);
    //         }
    //     });
    // });
}

async function fetchRandom(words) {
    let result = [];
    return new Promise(resolve => {
        for (let i = 0; i < words; i++) {
            let current = allText[getRandomInteger(0, allText.length - 1)].trim();
            result.push(current);
        }

        resolve(result);
    });

    // **************************************
    // If you want to use an API then comment the code above and uncomment the code below
    // **************************************

    // let randomLength = getRandomInteger(4, 6);
    // return new Promise(resolve => {
    //     $.get("https://random-word-api.herokuapp.com/word?lang=en&length=" + randomLength + "&number=" + words, function(data) {
    //         resolve(data);
    //     });
    // });
}

let wordButton = document.querySelector("label[for='word']");
let icon = wordButton.firstElementChild;

async function generateQuote() {
    hideWPMAccuracy();
    showLoading();
    wordButton.textContent = " quotes";
    wordButton.insertBefore(icon, wordButton.firstChild);

    let words = document.querySelector("#words-input").value;

    toBeTyped = await (fetchQuote(words))
    toBeTyped = toBeTyped.join(" ").trim();
    toBeTypedWordCount = toBeTyped.split(" ").length;

    let wordTotalSpan = document.querySelector("#word-total");
    wordTotalSpan.textContent = toBeTypedWordCount;

    let textarea = document.querySelector("textarea");
    textarea.value = toBeTyped;
    hideLoading();
    resetTypingTest();

    // **************************************************
    // Deprecated, the site cannot be used if your site has https
    // **************************************************

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

    if (toBeTyped == "") {
        generateNewTypingTest();
    }

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
        validateMinRandomWords();
        generateRandom();
    }
}

let lastTypedLength = 0;

function manageCurrentTest() {
    let wpm = Math.floor((correctInput / 5) * (60 / secondsPassed));
    let raw = Math.floor((input / 5) * (60 / secondsPassed));
    currentWPM.push(wpm);
    currentRawWPM.push(raw);
    currentTimeStamps.push(secondsPassed);

    if (secondsPassed >= 200) {
        generateNewTypingTest();
    }

    if (lastTypedLength == input) {
        blurTyping();
    } else {
        lastTypedLength = input;
    }
}

function startTimer() {
    secondsPassedCounter = setInterval(() => {
        secondsPassed += 1;
        manageCurrentTest();
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
    correctInputIndex.length = 0;
    wrongInputIndex.length = 0;
    typedType.length = 0;
    stopTimer();
    wordCount.textContent = 0;
    textarea.style.caretColor = "var(--tertiary-color)";

    textarea.selectionEnd = 0;
    textarea.selectionStart = 0;

    $("textarea").highlightWithinTextarea({
        highlight: [{
            highlight: null,
            className: "correct"
        }, {
            highlight: null,
            className: "wrong"
        }, {
            highlight: null,
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
    if (wordsCountInput.value < 10) {
        wordsCountInput.value = 10;
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
    setWebIcon();

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
let secondaryColor = "#2c2e31";
let tertiaryColor = "#e2b714";
let textColor = "#646669";
let headerColor = "#d1d0c5";

function toggleLightMode() {
    primaryColor = "#e8e9ec";
    secondaryColor = "#ccceda";
    tertiaryColor = "#2d539e";
    textColor = "#adb1c4";
    headerColor = "#33374c";

    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.documentElement.style.setProperty("--secondary-color", secondaryColor);
    document.documentElement.style.setProperty("--tertiary-color", tertiaryColor);
    document.documentElement.style.setProperty("--text-color", textColor);
    document.documentElement.style.setProperty("--header-color", headerColor);

    toggleThemeButton.firstElementChild.classList.remove("fa-moon");
    toggleThemeButton.firstElementChild.classList.add("fa-snowflake");

    changeLogChartColor()
}

function toggleDarkMode() {
    primaryColor = "#323437";
    secondaryColor = "#2c2e31";
    tertiaryColor = "#e2b714";
    textColor = "#646669";
    headerColor = "#d1d0c5";

    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.documentElement.style.setProperty("--secondary-color", secondaryColor);
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

function goHome(showFunc = null, title = null, text = null) {
    if (showFunc != null) {
        showFunc(title, text);
        setTimeout(() => {
            let winLocation = window.location.toString();
            let newLocation = winLocation.indexOf("?") != -1 ? location.protocol + '//' + location.host + location.pathname : winLocation.slice(0, winLocation.indexOf("?"));
            window.location.replace(newLocation);
        }, 3000);
    }
}

let notificationCenter = document.querySelector(".notification-center");

function showMessage(title, message) {
    let notificationMessage = document.createElement("div");
    notificationMessage.className = "notification-message";

    let notificationMessageContent = document.createElement("div");
    notificationMessageContent.className = "message";

    let notificationIcon = document.createElement("i");
    notificationIcon.className = "fa-solid fa-circle-check";

    let notificationTitle = document.createElement("div");
    notificationTitle.textContent = title;
    notificationTitle.className = "title";

    let notificationMessageText = document.createElement("div");
    notificationMessageText.textContent = message;
    notificationMessageText.className = "message-text";

    notificationMessageContent.append(notificationIcon, notificationTitle, notificationMessageText);
    notificationMessage.appendChild(notificationMessageContent);

    notificationCenter.appendChild(notificationMessage);

    setTimeout(() => {
        notificationCenter.removeChild(notificationMessage);
    }, 3000);

    notificationMessage.addEventListener("click", notificationCenter.removeChild(notificationMessage));
}

function showError(title, message) {
    let notificationMessage = document.createElement("div");
    notificationMessage.className = "notification-error";

    let notificationMessageContent = document.createElement("div");
    notificationMessageContent.className = "message";

    let notificationIcon = document.createElement("i");
    notificationIcon.className = "fa-solid fa-circle-xmark";

    let notificationTitle = document.createElement("div");
    notificationTitle.textContent = title;
    notificationTitle.className = "title";

    let notificationMessageText = document.createElement("div");
    notificationMessageText.textContent = message;
    notificationMessageText.className = "message-text";

    notificationMessageContent.append(notificationIcon, notificationTitle, notificationMessageText);
    notificationMessage.appendChild(notificationMessageContent);

    notificationCenter.appendChild(notificationMessage);

    setTimeout(() => {
        notificationCenter.removeChild(notificationMessage);
    }, 3000);
}


function setWebIcon() {
    let capitalIcon = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23${primaryColor.slice(1)}%22 data-darkreader-inline-fill=%22%22 style=%22--darkreader-inline-fill: %23352b82;%22></rect><path d=%22M22.87 70.57L22.87 70.57Q22.12 70.77 20.76 70.98Q19.40 71.18 17.90 71.18L17.90 71.18Q14.71 71.18 13.45 70.06Q12.19 68.94 12.19 66.08L12.19 66.08L12.19 29.29Q12.94 29.16 14.33 28.95Q15.73 28.75 17.09 28.75L17.09 28.75Q20.15 28.75 21.51 29.77Q22.87 30.79 22.87 33.78L22.87 33.78L22.87 46.02L37.90 29.02Q41.98 29.02 43.74 30.55Q45.51 32.08 45.51 34.26L45.51 34.26Q45.51 35.89 44.73 37.28Q43.95 38.68 42.18 40.45L42.18 40.45L32.52 50.10Q37.22 55.20 40.99 59.21Q44.76 63.23 47.21 65.67L47.21 65.67Q47.14 68.33 45.41 69.82Q43.68 71.32 41.36 71.32L41.36 71.32Q38.85 71.32 37.25 70.06Q35.65 68.80 34.16 67.10L34.16 67.10L22.87 54.32L22.87 70.57ZM86.38 40.11L86.38 40.11Q86.38 43.17 84.71 45.38Q83.05 47.59 79.92 48.81L79.92 48.81Q83.86 50.10 85.84 52.62Q87.81 55.13 87.81 58.67L87.81 58.67Q87.81 65.27 82.95 68.46Q78.08 71.66 68.90 71.66L68.90 71.66Q67.68 71.66 66.15 71.59Q64.62 71.52 63.02 71.35Q61.42 71.18 59.83 70.88Q58.23 70.57 56.94 70.09L56.94 70.09Q53.40 68.80 53.40 65.47L53.40 65.47L53.40 33.10Q53.40 31.74 54.11 30.99Q54.83 30.25 56.19 29.84L56.19 29.84Q58.43 29.09 61.76 28.72Q65.10 28.34 68.63 28.34L68.63 28.34Q77.13 28.34 81.76 31.23Q86.38 34.12 86.38 40.11ZM76.93 58.19L76.93 58.19Q76.93 53.37 70.74 53.37L70.74 53.37L63.74 53.37L63.74 62.89Q64.82 63.16 66.46 63.29Q68.09 63.43 69.58 63.43L69.58 63.43Q72.85 63.43 74.89 62.17Q76.93 60.91 76.93 58.19ZM63.74 36.77L63.74 45.82L70.06 45.82Q72.71 45.82 74.21 44.59Q75.70 43.37 75.70 40.99L75.70 40.99Q75.70 38.81 73.97 37.62Q72.24 36.43 68.77 36.43L68.77 36.43Q67.48 36.43 66.05 36.54Q64.62 36.64 63.74 36.77L63.74 36.77Z%22 fill=%22%23${tertiaryColor.slice(1)}%22 data-darkreader-inline-fill=%22%22 style=%22--darkreader-inline-fill: %232d2e2f;%22></path></svg>`;

    let lowerIcon = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23${primaryColor.slice(1)}%22 data-darkreader-inline-fill=%22%22 style=%22--darkreader-inline-fill: %23352b82;%22></rect><path d=%22M39.46 50.58L34.16 55.13L45.92 66.56Q45.58 69.41 44.19 70.94Q42.79 72.47 40.21 72.47L40.21 72.47Q38.24 72.47 36.74 71.52Q35.24 70.57 33.41 68.39L33.41 68.39L25.32 58.81L25.32 71.86Q24.64 72.07 23.41 72.24Q22.19 72.41 20.69 72.41L20.69 72.41Q17.63 72.41 16.27 71.42Q14.91 70.43 14.91 67.58L14.91 67.58L14.91 27.66Q15.66 27.46 16.88 27.25Q18.11 27.05 19.60 27.05L19.60 27.05Q22.66 27.05 23.99 28.07Q25.32 29.09 25.32 31.95L25.32 31.95L25.32 51.19L37.62 38.68Q40.82 38.68 42.72 40.11Q44.63 41.53 44.63 43.64L44.63 43.64Q44.63 45.48 43.37 46.87Q42.11 48.27 39.46 50.58L39.46 50.58ZM69.18 38.20L69.18 38.20Q72.51 38.20 75.43 39.29Q78.36 40.38 80.50 42.55Q82.64 44.73 83.86 47.96Q85.09 51.19 85.09 55.47L85.09 55.47Q85.09 59.76 83.80 63.02Q82.50 66.29 80.16 68.50Q77.81 70.71 74.51 71.83Q71.22 72.95 67.14 72.95L67.14 72.95Q62.85 72.95 59.79 71.93Q56.73 70.91 54.69 69.48L54.69 69.48Q51.77 67.51 51.77 64.31L51.77 64.31L51.77 27.66Q52.52 27.46 53.74 27.25Q54.96 27.05 56.46 27.05L56.46 27.05Q59.52 27.05 60.85 28.07Q62.17 29.09 62.17 31.95L62.17 31.95L62.17 39.70Q63.53 39.09 65.30 38.64Q67.07 38.20 69.18 38.20ZM67.27 46.36L67.27 46.36Q65.71 46.36 64.45 46.80Q63.19 47.25 62.10 47.93L62.10 47.93L62.10 63.50Q62.92 64.04 64.14 64.38Q65.37 64.72 67 64.72L67 64.72Q70.40 64.72 72.41 62.41Q74.41 60.10 74.41 55.47L74.41 55.47Q74.41 50.71 72.47 48.54Q70.54 46.36 67.27 46.36Z%22 fill=%22%23${tertiaryColor.slice(1)}%22 data-darkreader-inline-fill=%22%22 style=%22--darkreader-inline-fill: %232d2e2f;%22></path></svg>`;

    let iconLink = document.querySelector("link[rel='icon']");
    iconLink.href = lowerIcon;
}

let toggleThemeButton = document.querySelector("#theme");
let showTypingTestButton = document.querySelector("#typing-test");
let showHistoryButton = document.querySelector("#history");

let typingTestBody = document.querySelector("#body");
let historyBody = document.querySelector("#history-body");
let multiplayerBody = document.querySelector("#multiplayer-body");

toggleThemeButton.addEventListener("click", toggleTheme);

showTypingTestButton.addEventListener("click", showTypingTest);
showHistoryButton.addEventListener("click", showHistory);


let previousMode = "random";

let paragraphButton = document.querySelector("#paragraph");
let randomButton = document.querySelector("#random");
paragraphButton.addEventListener("click", () => {
    if (previousMode == "random") {
        randomButton.setAttribute('data-title', wordsCountInput.value);
    }
    wordsCountInput.value = parseInt(paragraphButton.getAttribute('data-title'));

    previousMode = "paragraph";
    generateQuote();
});

randomButton.addEventListener("click", () => {
    if (previousMode == "paragraph") {
        paragraphButton.setAttribute('data-title', wordsCountInput.value);
    }
    wordsCountInput.value = parseInt(randomButton.getAttribute('data-title'));

    previousMode = "random";
    generateRandom();
});

let wordsCountInput = document.querySelector("#words-input");
wordsCountInput.addEventListener("keydown", (event) => {
    if (event.key == "Enter" || event.key == "Return") {
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
    if (event.key == "Enter" || event.key == "Return") {
        generateNewTypingTest();
    } else if (event.key == "Tab") {
        restartButton.focus();
    }
});
nextButton.addEventListener("click", generateNewTypingTest);

let restartButton = document.querySelector("#restart-button");
restartButton.addEventListener("keydown", event => {
    event.preventDefault();
    if (event.key == "Enter" || event.key == "Return") {
        resetTypingTest();
    } else if (event.key == "Tab") {
        nextButton.focus();
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
let correctInputIndex = [];
let wrongInputIndex = [];
let accuracyList = [];
let wpmList = [];
let logTries = [];
let currentWPM = [];
let currentRawWPM = [];
let currentTimeStamps = [];
let currentMistakes = [];
let typedType = [];
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

function combineOverlappingArrays(arr) {
    let result = [];
    let currentRange = arr[0];

    for (let i = 1; i < arr.length; i++) {
        let nextRange = arr[i];

        if (currentRange[1] >= nextRange[0]) {
            currentRange[1] = Math.max(currentRange[1], nextRange[1]);
        } else {
            result.push(currentRange);
            currentRange = nextRange;
        }
    }
    result.push(currentRange);
    return result;
}

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


    if (!startedTyping) {
        startedTyping = true;
        startTimer();
    }

    input += 1;

    if (uInput == "Backspace") {
        if (userInput.length == 0) {
            return;
        }
        userInput = userInput.slice(0, -1);

        if (typedType[typedType.length - 1] == "correct") {
            correctInputIndex.pop();
        } else if (typedType[typedType.length - 1] == "wrong") {
            wrongInputIndex.pop();
        }
        typedType.pop();

        if (wrongInput > 0) {
            wrongInput -= 1;
        } else {
            correctInput -= 1;
        }
    } else {
        userInput += uInput;

        if (userInput[userInput.length - 1] == toBeTyped[userInput.length - 1]) {
            correctInputIndex.push([userInput.length - 1, userInput.length]);
            typedType.push("correct");
            correctInput += 1;
        } else {
            wrongInputIndex.push([userInput.length - 1, userInput.length]);
            typedType.push("wrong");
            wrongInput += 1;
            totalWrongInput += 1;
            textarea.style.caretColor = "var(--wrong-color)";

            let index = Object.keys(currentMistakes).findIndex(key => currentMistakes[key].x == secondsPassed > 0 ? secondsPassed : 1);
            if (index != -1) {
                currentMistakes[index].y = wrongInput;
            } else {
                currentMistakes.push({ x: secondsPassed, y: wrongInput })
            }
        }
    }

    textarea.style.caretColor = typedType[typedType.length - 1] == "correct" || typedType.length == 0 ? "var(--tertiary-color)" : "var(--wrong-color)";

    let cursorPosition = userInput.length;
    textarea.selectionEnd = cursorPosition;
    textarea.selectionStart = cursorPosition;

    let dummyWrong = Array.from(wrongInputIndex).map(x => {
        return Array.from(x);
    });

    let dummyCorrect = Array.from(correctInputIndex).map(x => {
        return Array.from(x);
    });

    $("#single-player-textarea").highlightWithinTextarea({
        highlight: [{
            highlight: dummyCorrect.length > 0 ? dummyCorrect : null,
            className: "correct"
        }, {
            highlight: dummyWrong.length > 0 ? dummyWrong : null,
            className: "wrong"
        }]
    })

    if (userInput.length == toBeTyped.length) {
        blurTyping();
        typingFinished = true;
        startedTyping = false;
        stopTimer();

        let accuracy = totalWrongInput == 0 ? 100 : Math.floor(((toBeTyped.length - totalWrongInput) / toBeTyped.length) * 100);
        let wpm = Math.floor((correctInput / 5) * (60 / secondsPassed));
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
    }

    let typedWords = userInput.slice(0, correctInput).trim().split(" ").length;
    wordCount.textContent = typedWords;


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
    if (event.key == "Unidentified" || textarea.disabled) return;
    handleUserInput(event.key);
    event.preventDefault();
});


let urlParams = new URLSearchParams(window.location.search);
let allText, allQuotes;
(async() => {
    allText = await readTextFile("easy_words.txt");
    allQuotes = await readTextFile("quotes.txt");
    if (!urlParams.has("code")) {
        generateRandom();
        // showMultiplayer();
        // showHistory();
        // showLogsTest();
    }
})();