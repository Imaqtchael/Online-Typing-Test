import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, get, query, update, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseSettings = {
    databaseURL: "https://keybored-cc9f6-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseSettings);
const database = getDatabase(app);
let bucketKey, self;

async function refreshFirebaseMultiplayerEntry() {
    await createNewBattleText();

    let gameDetails = {
        text: battle_toBeTyped,
        gameReady: false,
        gameStarted: false,
        gameFinish: false,
        timer: 10,
        winner: "none",
        player1: {
            present: true,
            finished: false,
            wrongInput: 0,
            correctInput: 0,
            wpm: 0,
            accuracy: 0,
            willNext: false
        },
        player2: {
            present: true,
            finished: false,
            wrongInput: 0,
            correctInput: 0,
            wpm: 0,
            accuracy: 0,
            willNext: false
        }

    }

    update(ref(database), {
        [bucketKey]: gameDetails
    });
}


async function initializeMultiplayer() {
    let bucketKeyLog = localStorage.getItem("code");
    self = "player1"
    if (bucketKeyLog == null) {
        await createNewBattleText();
        createFirebaseMultiplayerEntry();
    } else {
        let dbSnapshot = await get(query(ref(dabatase, bucketKey)));
        if (self == "player1") {
            refreshFirebaseMultiplayerEntry();
        }
    }
}

async function createNewBattleText() {
    let length = getRandomInteger(20, 30);
    battle_toBeTyped = await fetchRandom(length);
    battle_toBeTyped = battle_toBeTyped.join(" ");
}

function cleanBattleTextarea() {
    player1TextArea.style.caretColor = "var(--tertiary-color)";

    player1TextArea.selectionEnd = 0;
    player1TextArea.selectionStart = 0;

    $("#player-textarea").highlightWithinTextarea({
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
    $("#enemy-textarea").highlightWithinTextarea({
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
}

// let multiplayerBaseLink = "https://mjbarcenas.github.io/keybored?code=";
let multiplayerBaseLink = "192.168.1.3:5501?code=";
let player1TextArea = document.querySelector("#player-textarea");
let player2TextArea = document.querySelector("#enemy-textarea");
let codeLink = document.querySelector(".code-link");
let countDownTimer;
let countDown = 10;

let showMultiplayerButton = document.querySelector("#multiplayer");
showMultiplayerButton.addEventListener("click", () => {
    showMultiplayer();
    initializeMultiplayer();
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
localStorage.removeItem("code");

function startCountdownTimer() {
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

function setMultiplayerText(text) {
    player1TextArea.value = text;
    player2TextArea.value = text;
}

async function createFirebaseMultiplayerEntry() {
    let gameDetails = {
        text: battle_toBeTyped,
        gameReady: false,
        gameStarted: false,
        gameFinish: false,
        timer: 10,
        winner: "none",
        player1: {
            present: true,
            finished: false,
            wrongInput: 0,
            correctInput: 0,
            wpm: 0,
            accuracy: 0,
            willNext: false
        },
        player2: {
            present: false,
            finished: false,
            wrongInput: 0,
            correctInput: 0,
            wpm: 0,
            accuracy: 0,
            willNext: false
        }

    }

    bucketKey = push(ref(database), gameDetails).key;
    localStorage.setItem("code", bucketKey);
    setCodeToInput(multiplayerBaseLink + bucketKey);
    handleOnValue();
}

let battlePlayerDiv = document.querySelector("#player-div");
let battleEnemyDiv = document.querySelector("#enemy-div");
let battleParagraphButtons = document.querySelector("#battle-paragraph-buttons");
let enemyWPMSpan = document.querySelector("#battle-enemy-wpm");
let selfWPMSpan = document.querySelector("#battle-self-wpm");

function handleOnValue() {
    let battleHeading = document.querySelector("#battle-heading");

    onValue(ref(database, bucketKey), (snapshot) => {
        let tree = snapshot.val();
        let player1 = tree.player1;
        let player2 = tree.player2;
        let battle_gameReady = tree.gameReady;
        let battle_gameStarted = tree.gameStarted;
        let battle_gameFinish = tree.gameFinish;
        let battle_text = tree.text;
        let battle_timer = tree.timer;
        let battle_winner = tree.winner;

        if (player1.present && player2.present && !battle_gameReady) {
            stopBattle();
            cleanBattleTextarea();

            update(ref(database, bucketKey), { gameReady: true });
            codeLink.style.display = "none";
            battlePlayerDiv.style.display = "block";
            battleEnemyDiv.style.display = "block";
            startCountdownTimer();

            battle_toBeTyped = battle_text;
            setMultiplayerText(battle_text);
            player1TextArea.setAttribute("set", "");
        } else if (battle_gameReady && battle_timer >= 0 && !battle_gameStarted) {
            if (battle_timer > 0) {
                battleHeading.textContent = battle_timer;
            } else if (battle_timer >= 0 && self) {
                update(ref(database, bucketKey), { gameStarted: true });
                battle_startTimer();
                battleHeading.textContent = "go!";
                player1TextArea.disabled = false;
                player1TextArea.setSelectionRange(0, 0);
                player1TextArea.blur();
                player1TextArea.focus();
                stopCountdownTimer();
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
            } else if (!player1.finished && player2.finished) {
                updates["winner"] = 'player2';
            } else if (player1.finished && player2.finished) {
                updates["winner"] = 'draw';
            }
            update(ref(database, bucketKey), updates);
            player1TextArea.removeAttribute("set");
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

            battleHeading.style.visibility = "visible";
        }

        if (player1.willNext || player2.willNext) {
            if ((player1.willNext && player2.willNext) && self == "player1") {
                refreshFirebaseMultiplayerEntry();
            }

            battleHeading.style.visibility = "visible";
            battleHeading.style.color = "var(--header-color)";
            if ((player1.willNext && self == "player1") || (player2.willNext && self != "player1")) {
                battleHeading.textContent = "waiting for challenger to be ready...";
            } else if ((player1.willNext && self != "player1") || (player2.willNext && self == "player1")) {
                battleHeading.textContent = "challenger wants a new match...";
            }
        }

        let enemy = self == "player1" ? player2 : player1;
        if ((battle_gameReady && battle_gameStarted && !battle_gameFinish) && (enemy.correctInput > 0 || enemy.wrongInput > 0)) {
            let enemyCorrectInput = enemy.correctInput;
            let enemyWrongInput = enemy.wrongInput;
            let enemyWPM = enemy.wpm;
            $("#" + player2TextArea.id).highlightWithinTextarea({
                highlight: [{
                    highlight: enemyCorrectInput > 0 ? [0, enemyCorrectInput] : null,
                    className: "correct"
                }, {
                    highlight: enemyWrongInput > 0 ? [enemyCorrectInput, enemyCorrectInput + enemyWrongInput] : null,
                    className: "wrong"
                }, {
                    highlight: [enemyCorrectInput + enemyWrongInput, battle_toBeTyped.length],
                    className: "default"
                }]
            });

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
        copyButton.style.backgroundColor = "var(--tertiary-color)";
        copyButton.style.color = "var(--primary-color)";
    }, 2000);
}

function stopBattle() {
    battle_userInput = "";
    battle_toBeTyped = "";
    battle_input = 0;
    battle_correctInput = 0;
    battle_wrongInput = 0;
    battle_totalWrongInput = 0;
    battle_typingFinished = false;
    battle_secondsPassed = 0;
    countDown = 10;
    battle_stopTimer();
    stopCountdownTimer();
    player1TextArea.disabled = true;
    selfWPMSpan.textContent = 0;
    enemyWPMSpan.textContent = 0;
}

function battle_startTimer() {
    battle_secondsPassedCounter = setInterval(() => {
        battle_secondsPassed += 1;

        if (battle_secondsPassed > 200 && self == "player1") {
            stopBattle();
            refreshFirebaseMultiplayerEntry();
        }

        if (battle_input == 0) {
            return;
        }

        let wpm = Math.floor((battle_correctInput / 5) * (60 / battle_secondsPassed));
        let accuracy = battle_totalWrongInput == 0 ? 100 : Math.floor(((battle_correctInput - battle_totalWrongInput) / battle_toBeTyped.length) * 100);

        update(ref(database, bucketKey + "/" + self), {
            wpm: wpm,
            accuracy: accuracy,
            correctInput: battle_correctInput,
            wrongInput: battle_wrongInput
        });

        selfWPMSpan.textContent = wpm;

    }, 1000);
}

function battle_stopTimer() {
    clearInterval(battle_secondsPassedCounter);
}

let battle_userInput = "";
let battle_toBeTyped = "";
let battle_input = 0;
let battle_correctInput = 0;
let battle_wrongInput = 0;
let battle_totalWrongInput = 0;
let battle_typingFinished = false;
let battle_secondsPassed = 0;
let battle_secondsPassedCounter;

function handleMultiplayerBattle(uInput) {
    if ((battle_userInput.length == battle_toBeTyped.length && !battle_typingFinished && uInput != "Backspace") || battle_typingFinished || !/^[a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\-\+\=\{\[\}\]\|\\\:\;\"\'\<\,\>\.\?\/ ]$/.test(uInput) && uInput != "Backspace") {
        return;
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
                player1TextArea.style.caretColor = "var(--tertiary-color)";
            }
        } else {
            battle_correctInput -= 1;
        }
    } else {
        battle_userInput += uInput;
        if (battle_userInput[battle_userInput.length - 1] == battle_toBeTyped[battle_userInput.length - 1] && battle_wrongInput == 0) {
            battle_correctInput += 1;
            player1TextArea.style.caretColor = "var(--tertiary-color)";
        } else {
            battle_wrongInput += 1;
            battle_totalWrongInput += 1;
            player1TextArea.style.caretColor = "var(--wrong-color)";
        }

    }

    let cursorPosition = battle_userInput.length;
    player1TextArea.setSelectionRange(cursorPosition, cursorPosition);

    $("#" + player1TextArea.id).highlightWithinTextarea({
        highlight: [{
            highlight: battle_correctInput > 0 ? [0, battle_correctInput] : null,
            className: "correct"
        }, {
            highlight: battle_wrongInput > 0 ? [battle_correctInput, battle_correctInput + battle_wrongInput] : null,
            className: "wrong"
        }, {
            highlight: [battle_correctInput + battle_wrongInput, battle_toBeTyped.length],
            className: "default"
        }]
    });

    if (battle_userInput == battle_toBeTyped) {
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
        player1TextArea.disabled = true;
    }

    if (battle_toBeTyped.length - battle_userInput.length <= 40) {
        player1TextArea.scrollTop = player1TextArea.scrollHeight;
        player1TextArea.focus();
    } else {
        player1TextArea.blur();
        player1TextArea.focus();
    }
}

function willNext() {
    update(ref(database, bucketKey + "/" + self), { willNext: true });
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
        player1TextArea.focus();
    }
});

let battleParagraph = document.querySelector("#player-div");
battleParagraph.addEventListener("click", () => {
    player1TextArea.focus();
});

player1TextArea.addEventListener("mousedown", function(event) {
    event.preventDefault();
});
player1TextArea.addEventListener("contextmenu", function(event) {
    event.preventDefault();
});
player1TextArea.addEventListener("keypress", function(event) {
    event.preventDefault();
});
player1TextArea.addEventListener("keyup", function(event) {
    event.preventDefault();
});
player1TextArea.addEventListener("input", function(event) {
    player1TextArea.value = battle_toBeTyped;
    handleMultiplayerBattle(event.inputType == "deleteContentBackward" ? "Backspace" : event.data);
    event.preventDefault();
});
player1TextArea.addEventListener("keydown", function(event) {
    if (event.key == "Unidentified" && player1TextArea.disabled) return;
    handleMultiplayerBattle(event.key);
    event.preventDefault();
});

if (urlParams.has("code")) {
    bucketKey = urlParams.get("code");
    self = "player2"
    let dbSnapshot = await get(ref(database, bucketKey));
    console.log(dbSnapshot.val()); // <-- Gives the value of the whole tree
    if (!dbSnapshot.exists() || dbSnapshot.val().gameFinish) {
        alert("Game does not exists or is finished");
        generateRandom();
        showTypingTest();
    } else {
        showMultiplayer();
        update(ref(database, bucketKey + "/" + self), { present: true });
        handleOnValue();
    }
}