import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, get, update, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseSettings = {
    databaseURL: "https://keybored-cc9f6-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseSettings);
const database = getDatabase(app);
let bucketKey, self;

let multiplayerBaseLink = location.protocol + '//' + location.host + location.pathname + "?code=";
let battleTextArea = document.querySelector("#battle-textarea");
let codeLink = document.querySelector(".code-link");
let battleTypedWordCount = document.querySelector("#battle-typed-word");
let battleTotalWordCount = document.querySelector("#battle-word-total");
let battleEnemyScoreSpan = document.querySelector("#battle-enemy-score");
let battleSelfScoreSpan = document.querySelector("#battle-self-score");
let countDownTimer;
let countDown = 5;

function startCountdownTimer() {
    battleHeading.style.color = "var(--header-color)"
    countDownTimer = setInterval(() => {
        countDown -= 1;
        if (self == "player1") {
            update(ref(database, bucketKey), { timer: countDown });
        }
    }, 1000);
}

function stopCountdownTimer() {
    clearInterval(countDownTimer);
}

async function createNewBattleText() {
    let isRandom = getRandomInteger(0, 1) == 0;
    if (isRandom) {
        let length = getRandomInteger(20, 30);
        battle_toBeTyped = await fetchRandom(length);
    } else {
        battle_toBeTyped = await fetchQuote(1);
    }
    battle_toBeTyped = battle_toBeTyped.join(" ");
}

function setMultiplayerText(text) {
    battleTotalWordCount.textContent = text.split(" ").length;
    battleTextArea.value = text;
}

let showMultiplayerButton = document.querySelector("#multiplayer");
showMultiplayerButton.addEventListener("click", () => {
    if (!window.navigator.onLine) {
        hideMultiplayerIfOnline();
        return;
    }

    showMultiplayer();
    if (!bucketKey) {
        initializeMultiplayer();
    }
});

function showMultiplayer() {
    if (activeNavButton) {
        activeNavButton.classList.remove("active");
    }

    activeNavButton = showMultiplayerButton;
    activeNavButton.classList.add("active");

    multiplayerBody.style.display = "flex";
    typingTestBody.style.display = "none";
    historyBody.style.display = "none";
}

async function initializeMultiplayer() {
    bucketKey = localStorage.getItem("code");
    self = "player1"
    if (bucketKey == null) {
        await createNewBattleText();
        createFirebaseMultiplayerEntry();
    } else {
        let dbSnapshot = await get(ref(database, bucketKey));
        if (dbSnapshot.exists()) {
            let dbValue = dbSnapshot.val();
            if (dbValue.gameFinish) {
                handleOnValue();
                await refreshFirebaseMultiplayerEntry();
            } else {
                setCodeToInput(multiplayerBaseLink + bucketKey);
                setMultiplayerText(dbValue.text);
                battle_toBeTyped = dbValue.text;
                handleOnValue();
                if (dbValue.timer > 0) {
                    countDown = dbValue.timer;
                    startCountdownTimer();
                }

                battlePlayerDiv.style.visibility = "visible";
                codeLink.style.visibility = "hidden";

                if (dbValue.timer == 0) {
                    battleHeading.style.visibility = "hidden";
                    battleTextArea.disabled = false;
                    battle_startTimer();
                } else {
                    battleHeading.style.visibility = "visible";
                    battleTextArea.disabled = true;
                }

                battleTextArea.setSelectionRange(0, 0);
                battleTextArea.blur();
                battleTextArea.focus();
            }
        } else {
            localStorage.removeItem("code");
            initializeMultiplayer();
        }
    }
}

async function cleanFirebase() {
    let dbSnapshot = await get(ref(database));
    if (dbSnapshot.exists()) {
        let dbValue = dbSnapshot.val();
        let bucketKeys = Object.keys(dbValue);
        let dateNow = new Date().getTime();
        for (let i = 0; i < bucketKeys.length; i++) {
            let bucket = dbValue[bucketKeys[i]];
            if (((dateNow - bucket.lastPlayed) / 1000) > 60 * 10) {
                remove(ref(database, bucketKeys[i]));
            }
        }
    }
}

async function createFirebaseMultiplayerEntry() {
    let gameDetails = {
        text: battle_toBeTyped,
        gameReady: false,
        gameStarted: false,
        gameFinish: false,
        timer: 10,
        winner: "none",
        player1Score: 0,
        player1WillNext: false,
        player1Present: true,
        player2Score: 0,
        player2WillNext: false,
        player2Present: false,
        lastPlayed: new Date().getTime(),
        player1: {
            finished: false,
            wrongInput: 0,
            correctInput: 0,
            wpm: 0,
            accuracy: 0
        },
        player2: {
            finished: false,
            wrongInput: 0,
            correctInput: 0,
            wpm: 0,
            accuracy: 0
        }

    }

    bucketKey = push(ref(database), gameDetails).key;
    localStorage.setItem("code", bucketKey);
    setCodeToInput(multiplayerBaseLink + bucketKey);
    handleOnValue();
}

async function refreshFirebaseMultiplayerEntry() {
    await createNewBattleText();

    let gameDetails = {
        text: battle_toBeTyped,
        gameReady: false,
        gameStarted: false,
        gameFinish: false,
        timer: 10,
        winner: "none",
        lastPlayed: new Date().getTime(),
        player1: {
            finished: false,
            wrongInput: 0,
            correctInput: 0,
            wpm: 0,
            accuracy: 0
        },
        player2: {
            finished: false,
            wrongInput: 0,
            correctInput: 0,
            wpm: 0,
            accuracy: 0
        }
    }

    update(ref(database, bucketKey), gameDetails);
    setCodeToInput(multiplayerBaseLink + bucketKey);
}

// Test Logic

let battlePlayerDiv = document.querySelector("#player-div");
let battleParagraphButtons = document.querySelector("#battle-paragraph-buttons");
let enemyWPMSpan = document.querySelector("#battle-enemy-wpm");
let selfWPMSpan = document.querySelector("#battle-self-wpm");
let battleHeading = document.querySelector("#battle-heading");

function handleOnValue() {
    onValue(ref(database, bucketKey), (snapshot) => {
        let tree = snapshot.val();
        let bothPlayerPresent = tree.player1Present && tree.player2Present;
        let player1 = tree.player1;
        let player2 = tree.player2;
        let battle_gameReady = tree.gameReady;
        let battle_gameStarted = tree.gameStarted;
        let battle_gameFinish = tree.gameFinish;
        let battle_text = tree.text;
        let battle_timer = tree.timer;
        let battle_winner = tree.winner;

        if (bothPlayerPresent && !battle_gameReady) {
            stopBattle();
            cleanBattleTextarea();
            focusBattleTyping();
            battlePlayerDiv.style.visibility = "visible";
            battleHeading.style.visibility = "visible";

            update(ref(database, bucketKey), { gameReady: true });
            codeLink.style.visibility = "hidden";
            startCountdownTimer();

            setMultiplayerText(battle_text);
            battle_toBeTyped = battle_text;
            battleTextArea.setAttribute("set", "");
        } else if (battle_gameReady && battle_timer >= 0 && !battle_gameStarted) {
            if (battle_timer > 0) {
                battleHeading.textContent = battle_timer;
            } else if (battle_timer >= 0) {
                update(ref(database, bucketKey), { gameStarted: true });
                battle_startTimer();
                stopCountdownTimer();
                battleHeading.style.color = "var(--tertiary-color)";
                battleHeading.textContent = "go!";
                battleTextArea.disabled = false;
                battleTextArea.setSelectionRange(0, 0);
                battleTextArea.blur();
                battleTextArea.focus();
                setTimeout(() => {
                    battleHeading.style.visibility = "hidden";
                }, 1000);
            }
        } else if ((player1.finished || player2.finished) && !battle_gameFinish) {
            let updates = {
                gameFinish: true
            };
            if (player1.finished && !player2.finished) {
                updates["winner"] = "player1";
                updates["player1Score"] = tree.player1Score += 1;
            } else if (!player1.finished && player2.finished) {
                updates["winner"] = 'player2';
                updates["player2Score"] = tree.player2Score += 1;
            } else if (player1.finished && player2.finished) {
                updates["winner"] = 'draw';
            }
            update(ref(database, bucketKey), updates);
            battleTextArea.removeAttribute("set");
        } else if (battle_winner != "none") {
            if (battle_winner == "draw") {
                battleHeading.textContent = "draw!";
                battleHeading.style.color = "var(--header-color)";
            } else if (battle_winner == self) {
                battleHeading.textContent = "you win!";
                battleHeading.style.color = "var(--tertiary-color)";
            } else if (battle_winner != self) {
                battleHeading.textContent = "you lose!";
                battleHeading.style.color = "var(--wrong-color)";
            }

            battleSelfScoreSpan.textContent = self == "player1" ? tree.player1Score : tree.player2Score;
            battleEnemyScoreSpan.textContent = self == "player1" ? tree.player2Score : tree.player1Score;

            battleHeading.style.visibility = "visible";
            battleTextArea.disabled = true;
        }

        if (tree.player1WillNext || tree.player2WillNext) {
            if ((tree.player1WillNext && tree.player2WillNext) && self == "player1") {
                refreshFirebaseMultiplayerEntry();
                update(ref(database, bucketKey), {
                    player1WillNext: false,
                    player2WillNext: false,
                })
            }

            battleHeading.style.visibility = "visible";
            battleHeading.style.color = "var(--header-color)";
            if ((tree.player1WillNext && self == "player1") || (tree.player2WillNext && self != "player1")) {
                battleHeading.textContent = "waiting for challenger to be ready...";
            } else if ((tree.player1WillNext && self != "player1") || (tree.player2WillNext && self == "player1")) {
                battleHeading.textContent = "challenger wants a new match...";
            }
        }

        let enemy = self == "player1" ? player2 : player1;
        if ((battle_gameReady && battle_gameStarted && !battle_gameFinish) && (enemy.correctInput > 0 || enemy.wrongInput > 0)) {
            battle_enemyCorrectInput = enemy.correctInput;
            let enemyWPM = enemy.wpm;

            highlighted = [highlighted[0], highlighted[1], {
                highlight: battle_enemyCorrectInput > battle_correctInput + battle_wrongInput ? [battle_correctInput + battle_wrongInput, battle_enemyCorrectInput] : null,
                className: "enemy"
            }];

            $("#battle-textarea").highlightWithinTextarea({
                highlight: highlighted
            });

            if (battle_toBeTyped.length - battle_userInput.length <= 40) {
                battleTextArea.scrollTop = battleTextArea.scrollHeight;
                battleTextArea.focus();
            } else {
                battleTextArea.blur();
                battleTextArea.focus();
            }
            enemyWPMSpan.textContent = enemyWPM;
        }
    });
}

function deleteFirebaseMultiplayerEntry() {
    let entry = ref(database, bucketKey);
    remove(entry);
}

function setCodeToInput(link) {
    let codeInput = document.querySelector("#code-link-input");
    codeInput.value = link;
}

function copyMultiplayerLink() {
    let linkInput = document.querySelector("#code-link-input");
    linkInput.select();
    linkInput.setSelectionRange(0, this.value.length);

    navigator.clipboard.writeText(linkInput.value);

    let copyButton = document.querySelector("#copy-link-button");
    copyButton.textContent = "copied!";
    copyButton.style.backgroundColor = "var(--secondary-color)";
    copyButton.style.color = "var(--header-color)";
    setTimeout(() => {
        copyButton.textContent = "copy";
    }, 2000);
}

function stopBattle() {
    blurBattleTyping();

    battle_typingFocused = false;
    battle_userInput = "";
    battle_toBeTyped = "";
    battle_input = 0;
    battle_correctInput = 0;
    battle_enemyCorrectInput = 0;
    battle_wrongInput = 0;
    battle_totalWrongInput = 0;
    battle_typingFinished = false;
    battle_secondsPassed = 0;
    battleLastTypedLength = 0;
    countDown = 5;
    highlighted = [{
        highlight: null,
        className: "correct"
    }, {
        highlight: null,
        className: "wrong"
    }, {
        highlight: null,
        className: "enemy"
    }];
    battle_stopTimer();
    stopCountdownTimer();
    battleTextArea.disabled = true;
    selfWPMSpan.textContent = 0;
    enemyWPMSpan.textContent = 0;
    battleTypedWordCount.textContent = 0;
}

function cleanBattleTextarea() {
    battleTextArea.style.caretColor = "var(--tertiary-color)";

    battleTextArea.selectionEnd = 0;
    battleTextArea.selectionStart = 0;

    $("#battle-textarea").highlightWithinTextarea({
        highlight: [{
            highlight: null,
            className: "correct"
        }, {
            highlight: null,
            className: "wrong"
        }, {
            highlight: null,
            className: "enemy"
        }]
    });
}

function manageBattleTest() {
    if (battle_correctInput == 0) {
        return;
    }

    let wpm = Math.floor((battle_correctInput / 5) * (60 / battle_secondsPassed));
    let accuracy = battle_totalWrongInput == 0 ? 100 : Math.floor(((battle_correctInput - battle_totalWrongInput) / battle_toBeTyped.length) * 100);

    if (wpm != Infinity) {
        update(ref(database, bucketKey + "/" + self), {
            wpm: wpm,
            accuracy: accuracy,
            correctInput: battle_correctInput,
            wrongInput: battle_wrongInput
        });
        selfWPMSpan.textContent = wpm;
    }

}

let battleLastTypedLength = 0;

function battle_startTimer() {
    battle_secondsPassedCounter = setInterval(() => {
        battle_secondsPassed += 1;

        if (battle_secondsPassed > 300) {
            stopBattle();
            goHome(showError, "Error", "The game cannot run for too long, going back to normal mode.");
        }

        if (battleLastTypedLength == battle_input) {
            blurBattleTyping();
        } else {
            battleLastTypedLength = battle_input;
            manageBattleTest();
        }
    }, 1000);
}

function battle_stopTimer() {
    clearInterval(battle_secondsPassedCounter);
}

function blurBattleTyping() {
    battle_typingFocused = false;

    navButtons.style.visibility = "visible";
    codeLink.style.visibility = self == "player1" ? "visible" : "hidden";
    battleParagraphButtons.style.visibility = "visible";
}

function focusBattleTyping() {
    battle_typingFocused = false;

    navButtons.style.visibility = "hidden";
    codeLink.style.visibility = "hidden";
    battleParagraphButtons.style.visibility = "hidden";
}

function hideMultiplayerIfOnline() {
    let multiplayerButton = document.querySelector("button#multiplayer");

    if (window.navigator.onLine) {
        multiplayerButton.style.display = "inline-block";
    } else {
        multiplayerButton.style.display = "none";
    }
}

let battle_typingFocused = false
let battle_userInput = "";
let battle_toBeTyped = "";
let battle_input = 0;
let battle_correctInput = 0;
let battle_enemyCorrectInput = 0;
let battle_wrongInput = 0;
let battle_totalWrongInput = 0;
let battle_typingFinished = false;
let battle_secondsPassed = 0;
let battle_secondsPassedCounter;
let highlighted = [{
    highlight: null,
    className: "correct"
}, {
    highlight: null,
    className: "wrong"
}, {
    highlight: [6, 16],
    className: "enemy"
}, {
    highlight: null,
    className: "default"
}];

function handleMultiplayerBattle(uInput) {
    if ((battle_userInput.length == battle_toBeTyped.length && !battle_typingFinished && uInput != "Backspace") || battle_typingFinished || !/^[a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\-\+\=\{\[\}\]\|\\\:\;\"\'\<\,\>\.\?\/ ]$/.test(uInput) && uInput != "Backspace") {
        return;
    }

    if (!battle_typingFocused) {
        focusBattleTyping();
    }

    battle_input += 1;

    if (uInput == "Backspace") {
        if (battle_userInput.length == 0) {
            return;
        }
        battle_userInput = battle_userInput.slice(0, -1);

        if (battle_wrongInput > 0) {
            battle_wrongInput -= 1;

            if (battle_wrongInput == 0) {
                battleTextArea.style.caretColor = "var(--tertiary-color)";
            }
        } else {
            battle_correctInput -= 1;
        }
    } else {
        battle_userInput += uInput;
        if (battle_userInput[battle_userInput.length - 1] == battle_toBeTyped[battle_userInput.length - 1] && battle_wrongInput == 0) {
            battle_correctInput += 1;
            battleTextArea.style.caretColor = "var(--tertiary-color)";
        } else {
            battle_wrongInput += 1;
            battle_totalWrongInput += 1;
            battleTextArea.style.caretColor = "var(--wrong-color)";
        }
    }

    let cursorPosition = battle_userInput.length;
    battleTextArea.setSelectionRange(cursorPosition, cursorPosition);
    highlighted = [{
            highlight: battle_correctInput > 0 ? [0, battle_correctInput] : null,
            className: "correct"
        },
        {
            highlight: battle_wrongInput > 0 ? [battle_correctInput, battle_correctInput + battle_wrongInput] : null,
            className: "wrong"
        },
        {
            highlight: battle_enemyCorrectInput > battle_correctInput + battle_wrongInput ? [battle_correctInput + battle_wrongInput, battle_enemyCorrectInput] : null,
            className: "enemy"
        }
    ];

    $("#battle-textarea").highlightWithinTextarea({
        highlight: highlighted
    });


    manageBattleTest();


    if (battle_userInput == battle_toBeTyped) {
        blurBattleTyping();
        battle_typingFinished = true;
        battle_stopTimer();

        let accuracy = battle_totalWrongInput == 0 ? 100 : Math.floor(((battle_toBeTyped.length - battle_totalWrongInput) / battle_toBeTyped.length) * 100);
        let wpm = Math.floor((battle_toBeTyped.length / 5) * (60 / battle_secondsPassed));

        let selfWPMSpan = document.querySelector("#battle-self-wpm");
        selfWPMSpan.textContent = wpm;

        update(ref(database, bucketKey + "/" + self), {
            wpm: wpm,
            accuracy: accuracy,
            correctInput: battle_correctInput,
            finished: true
        });
        battleTextArea.disabled = true;
    }

    let typedWords = battle_userInput.slice(0, battle_correctInput).trim().split(" ").length;
    battleTypedWordCount.textContent = typedWords;


    if (battle_toBeTyped.length - battle_userInput.length <= 40) {
        battleTextArea.scrollTop = battleTextArea.scrollHeight;
        battleTextArea.focus();
    } else {
        battleTextArea.blur();
        battleTextArea.focus();
    }
}

function willNext() {
    update(ref(database, bucketKey), {
        [self + "WillNext"]: true
    });
}

let battleWillNext = document.querySelector("#battle-next-button");
battleWillNext.addEventListener("click", willNext);

let copyLinkButton = document.querySelector("#copy-link-button");
copyLinkButton.addEventListener("click", copyMultiplayerLink);

let linkInput = document.querySelector("#code-link-input");
linkInput.addEventListener("click", () => {
    linkInput.setSelectionRange(0, linkInput.value.length);
});

let html = document.querySelector("html");
html.addEventListener("mousedown", event => {
    if (event.target != linkInput && linkInput.selectionEnd > 1) {
        linkInput.setSelectionRange(0, 0);
    } else if (event.target == document.querySelector("mark")) {
        battleTextArea.focus();
    }
});

let battleParagraph = document.querySelector("#player-div");
battleParagraph.addEventListener("click", () => {
    battleTextArea.focus();
});

battleTextArea.addEventListener("mousedown", function(event) {
    event.preventDefault();
});
battleTextArea.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});
battleTextArea.addEventListener("keypress", function(event) {
    event.preventDefault();
});
battleTextArea.addEventListener("keyup", function(event) {
    event.preventDefault();
});
battleTextArea.addEventListener("input", function(event) {
    event.preventDefault();
    battleTextArea.value = battle_toBeTyped;
    handleMultiplayerBattle(event.inputType == "deleteContentBackward" ? "Backspace" : event.data);
});
battleTextArea.addEventListener("keydown", function(event) {
    event.preventDefault();
    if (event.key == "Unidentified") return;
    handleMultiplayerBattle(event.key);
});

// localStorage.removeItem("code");
// cleanFirebase();
hideMultiplayerIfOnline();
if (urlParams.has("code")) {
    bucketKey = urlParams.get("code");
    self = "player2"
    let dbSnapshot = await get(ref(database, bucketKey));
    //console.log(dbSnapshot.val()); // <-- Gives the value of the whole tree
    if (!dbSnapshot.exists()) {
        goHome(showError, "Error", "The game you want to join does not exist, the game will now reload.");
    } else if (dbSnapshot.exists()) {
        let dbValue = dbSnapshot.val();
        let lastPlayedSecondsPassed = (new Date().getTime() - dbValue.lastPlayed) / 1000;
        if (dbValue.gameFinish) {
            showMultiplayer();
            handleOnValue();
            blurBattleTyping();
            battlePlayerDiv.style.visibility = "visible";
            update(ref(database, bucketKey), {
                [self + "WillNext"]: true,
                [self + "Present"]: true
            });
            setMultiplayerText(dbValue.text);
            enemyWPMSpan.textContent = self == "player1" ? dbValue.player2.wpm : dbValue.player1.wpm;
            selfWPMSpan.textContent = self == "player1" ? dbValue.player1.wpm : dbValue.player2.wpm;
        } else if (lastPlayedSecondsPassed > 60 * 10) {
            remove(ref(database, bucketKey));
            goHome(showError, "Error", "The game you wanted to join is inactive, the game will now reload.");
        } else {
            showMultiplayer();
            update(ref(database, bucketKey), {
                [self + "Present"]: true
            });
            setMultiplayerText(dbValue.text);
            battle_toBeTyped = dbValue.text;
            handleOnValue();

            battlePlayerDiv.style.visibility = "visible";
            codeLink.style.visibility = "hidden";

            if (dbValue.timer == 0) {
                battleHeading.style.visibility = "hidden";
                battleTextArea.disabled = false;
                battle_startTimer();
            } else {
                battleHeading.style.visibility = "visible";
                battleTextArea.disabled = true;
            }

            battleTextArea.setSelectionRange(0, 0);
            battleTextArea.blur();
            battleTextArea.focus();
        }
    }
}