import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseSettings = {
    databaseURL: "https://keybored-cc9f6-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseSettings);
const database = getDatabase(app);
let multiplayerEntry, self;

function initializeMultiplayer() {
    generatePlayerID();
    if (localStorage.getItem("code") == null) {
        generateMultiplayerLink();
    } else {
        setCodeToInput(multiplayerBaseLink + localStorage.getItem("code"));
    }
    // createFirebaseMultiplayerEntry(multiplayerEntry);
}

let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
let num = "0123456789";
let multiplayerBaseLink = "https://mjbarcenas.github.io/keybored?code=";

function generateMultiplayerLink() {
    let code = "";
    for (let i = 0; i < 3; i++) {
        code += `${alphabet[getRandomInteger(0, alphabet.length - 1)]}${num[getRandomInteger(0, num.length - 1)]}`;
    }

    self = "player1";
    multiplayerEntry = localStorage.getItem("user-id");
    localStorage.setItem("code", code);
    setCodeToInput(multiplayerBaseLink + code)
}

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

function generatePlayerID() {
    let code = "user";
    for (let i = 0; i < 3; i++) {
        code += `${alphabet[getRandomInteger(0, alphabet.length - 1)]}${num[getRandomInteger(0, num.length - 1)]}`;
    }

    localStorage.setItem("user-id", code);
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
})

initializeMultiplayer();