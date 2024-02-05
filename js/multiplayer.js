import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseSettings = {
    databaseURL: "https://keybored-cc9f6-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseSettings);
const database = getDatabase(app);
let multiplayerEntry, bucketKey;

async function initializeMultiplayer() {
    generatePlayerID();
    if (localStorage.getItem("code") == null) {
        generateMultiplayerLink();
    } else {
        setCodeToInput(multiplayerBaseLink + localStorage.getItem("code"));
    }
    let length = getRandomInteger(20, 30);
    battle_toBeTyped = await fetchRandom(length);
    battle_toBeTyped = battle_toBeTyped.join(" ");
    createFirebaseMultiplayerEntry(multiplayerEntry);
    update(ref(database, bucketKey + "/player2"), { present: true });
}

let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
let num = "0123456789";
let multiplayerBaseLink = "https://mjbarcenas.github.io/keybored?code=";
let player1TextArea = document.querySelector("#player-textarea");
let player2TextArea = document.querySelector("#enemy-textarea");
let codeLink = document.querySelector(".code-link");
let countDownTimer;
let countDown = 10;

function startCountdownTimer() {
    countDownTimer = setInterval(() => {
        countDown -= 1;
        update(ref(database, bucketKey), { timer: countDown });
    }, 1000);
}

function stopCountdownTimer() {
    clearInterval(countDownTimer);
}

function generateMultiplayerLink() {
    let code = "";
    for (let i = 0; i < 3; i++) {
        code += `${alphabet[getRandomInteger(0, alphabet.length - 1)]}${num[getRandomInteger(0, num.length - 1)]}`;
    }
    multiplayerEntry = localStorage.getItem("user-id");
    localStorage.setItem("code", code);
    setCodeToInput(multiplayerBaseLink + code);
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
        [multiplayerEntry]: {
            present: true,
            finished: false,
            wrongInput: 0,
            correctInput: 0,
            wpm: 0,
            accuracy: 0
        },
        player2: {
            id: "none",
            present: false,
            finished: false,
            wrongInput: 0,
            correctInput: 0,
            wpm: 0,
            accuracy: 0
        }

    }
    bucketKey = push(ref(database), gameDetails).key;

    let countDownDiv = document.querySelector("#countdown-timer");
    let winnerDiv = document.querySelector("#winner-text-div");
    onValue(ref(database, bucketKey), (snapshot) => {
        let tree = snapshot.val();
        let player1 = tree[multiplayerEntry];
        let player2 = tree.player2;
        let battle_gameReady = tree.gameReady;
        let battle_gameStarted = tree.gameStarted;
        let battle_gameFinish = tree.gameFinish;
        let battle_text = tree.text;
        let battle_timer = tree.timer;
        let battle_winner = tree.winner;
        console.clear();
        console.log(tree);

        if (player1.present && player2.present && !battle_gameReady) {
            update(ref(database, bucketKey), { gameReady: true });
            codeLink.style.display = "none";
            startCountdownTimer();
        } else if (battle_gameReady && battle_timer >= 0 && !battle_gameStarted) {
            if (!player1TextArea.hasAttribute("set")) {
                setMultiplayerText(battle_toBeTyped);
                player1TextArea.setAttribute("set", "");
            }

            if (battle_timer > 0) {
                countDownDiv.textContent = battle_timer;
            } else if (battle_timer >= 0) {
                update(ref(database, bucketKey), { gameStarted: true });
                battle_startTimer();
                countDownDiv.textContent = "go!";
                player1TextArea.disabled = false;
                player1TextArea.setSelectionRange(0, 0);
                player1TextArea.blur();
                player1TextArea.focus();
                stopCountdownTimer();
                setTimeout(() => {
                    countDownDiv.style.visibility = "hidden";
                }, 1000);
            }
        } else if ((player1.finished || player2.finished) && !battle_gameFinish) {
            let updates = {
                gameFinish: true
            };
            if (player1.finished && !player2.finished) {
                updates["winner"] = multiplayerEntry;
            } else if (!player1.finished && player2.finished) {
                updates["winner"] = 'player2';
            } else if (player1.finished && player2.finished) {
                updates["winner"] = 'draw';
            }
            update(ref(database, bucketKey), updates);
            player1TextArea.removeAttribute("set");
        } else if (battle_winner != "none") {
            let winnerText;
            if (battle_winner == "draw") {
                winnerText = "draw!";
            } else if (battle_winner == multiplayerEntry) {
                winnerText = "you win!";
            } else if (battle_winner == "player2") {
                winnerText = "you lose!";
            }
            winnerDiv.textContent = winnerText;
        }
    });
}

function deleteFirebaseMultiplayerEntry() {
    let entry = ref(database, bucketKey);
    remove(entry);
}

function generatePlayerID() {
    let code = "user";
    for (let i = 0; i < 3; i++) {
        code += `${alphabet[getRandomInteger(0, alphabet.length - 1)]}${num[getRandomInteger(0, num.length - 1)]}`;
    }

    localStorage.setItem("user-id", code);
}

// function

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

}

function battle_startTimer() {
    battle_secondsPassedCounter = setInterval(() => {
        battle_secondsPassed += 1;

        let wpm = Math.floor((battle_correctInput / 5) * (60 / battle_secondsPassed));
        let accuracy = battle_totalWrongInput == 0 ? 100 : battle_input == 0 ? 0 : Math.floor(((battle_correctInput - battle_totalWrongInput) / battle_toBeTyped.length) * 100);

        update(ref(database, bucketKey + "/" + multiplayerEntry), {
            wpm: wpm,
            accuracy: accuracy,
            correctInput: battle_correctInput,
            wrongInput: battle_wrongInput
        });

        if (battle_secondsPassed > 200) {
            stopBattle();
        }
    }, 1000);
}

function battle_stopTimer() {
    clearInterval(battle_secondsPassedCounter)
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

        update(ref(database, bucketKey + "/" + multiplayerEntry), {
            wpm: wpm,
            accuracy: accuracy,
            finished: true
        });
    }

    if (battle_toBeTyped.length - battle_userInput.length <= 40) {
        player1TextArea.scrollTop = player1TextArea.scrollHeight;
        player1TextArea.focus();
    } else {
        player1TextArea.blur();
        player1TextArea.focus();
    }
}

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
    }
});

let paragraph = player1TextArea.parentElement;
paragraph.addEventListener("click", () => {
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

localStorage.removeItem("code");
localStorage.removeItem("user-id");
initializeMultiplayer();