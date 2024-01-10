import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseSettings = {
    databaseURL: "https://keybored-cc9f6-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseSettings);
const database = getDatabase(app);
let multiplayerEntry, self;


let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
let num = "0123456789";

function showMultiplayer() {
    generateMultiplayerLink();
    createFirebaseMultiplayerEntry(multiplayerEntry);

    multiplayerBody.style.display = "flex";
    typingTestBody.style.display = "none";
    historyBody.style.display = "none";
}
showMultiplayerButton.addEventListener("click", showMultiplayer);

function generateMultiplayerLink() {
    let code = "";
    for (let i = 0; i < 3; i++) {
        code += `${alphabet[getRandomInteger(0, alphabet.length - 1)]}${num[getRandomInteger(0, num.length - 1)]}`;
    }

    let link = "https://mjbarcenas.github.io/Online-Typing-Test?code=" + code;
    let codeInput = document.querySelector("#multiplayer-link");
    codeInput.value = link;
    multiplayerEntry = code;
    self = "player1";
}

function copyMultiplayerLink() {
    let linkInput = document.querySelector("#multiplayer-link");
    linkInput.select();
    linkInput.setSelectionRange(0, 9999);

    navigator.clipboard.writeText(linkInput.value);

    let copyButton = document.querySelector("#copy-url-button");
    copyButton.textContent = "copied!";
}

let copyLinkButton = document.querySelector("#copy-url-button");
copyLinkButton.addEventListener("click", copyMultiplayerLink);

async function createFirebaseMultiplayerEntry(code) {
    let length = getRandomInteger(30, 60);
    let text = await fetchQuote();

    let gameDetails = {
        text: text,
        player1Input: "",
        player2Input: "",
        player2present: false
    }
    push(ref(database, code), gameDetails);
}

function deleteFirebaseMultiplayerEntry(code) {
    let entry = ref(database, code);
    remove(entry);
}