import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  remove,
  child,
  get
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDTQvxP6ERHw5e00BIFsEPy1R80Ma_6qfM",
  authDomain: "happeechat.firebaseapp.com",
  databaseURL: "https://happeechat-default-rtdb.firebaseio.com",
  projectId: "happeechat",
  storageBucket: "happeechat.firebasestorage.app",
  messagingSenderId: "851920750529",
  appId: "1:851920750529:web:8e15bf1c0b685aa2c41140",
  measurementId: "G-JTMNJS18XP"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let username = "";

// Start chat after setting username
function startChat() {
  const input = document.getElementById("username-input");
  username = input.value.trim() || "Anonymous";

  document.getElementById("username-form").style.display = "none";
  document.getElementById("chat-box").style.display = "block";
  document.getElementById("chat-form").style.display = "flex";

  listenForMessages();
  cleanOldMessages(); // Initial cleanup
}

window.startChat = startChat; // <-- This is the fix


// Send message
window.sendMessage = () => {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (text !== "") {
    const timestamp = Date.now();
    const messageRef = ref(db, "messages/" + timestamp);
    set(messageRef, {
      text,
      timestamp,
      username
    });
    input.value = "";
  }
};

// Display messages
const chatBox = document.getElementById("chat-box");
const messagesRef = ref(db, "messages");

function listenForMessages() {
  onValue(messagesRef, (snapshot) => {
    const messages = snapshot.val();
    chatBox.innerHTML = "";
    if (messages) {
      const keys = Object.keys(messages).sort();
      keys.forEach((key) => {
        const msg = messages[key];
        const p = document.createElement("p");
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        p.textContent = `[${time}] ${msg.username || "Unknown"}: ${msg.text}`;
        chatBox.appendChild(p);
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  });
}

// Delete messages older than 12 hours or keep only latest 300
function cleanOldMessages() {
  get(messagesRef).then((snapshot) => {
    const messages = snapshot.val();
    if (!messages) return;

    const now = Date.now();
    const keys = Object.keys(messages);
    const keysToDelete = [];

    keys.sort((a, b) => parseInt(a) - parseInt(b));

    for (let i = 0; i < keys.length; i++) {
      const msg = messages[keys[i]];
      const age = now - msg.timestamp;
      if (age > 12 * 60 * 60 * 1000 || keys.length - i > 300) {
        keysToDelete.push(keys[i]);
      }
    }

    keysToDelete.forEach((key) => {
      remove(ref(db, "messages/" + key));
    });
  });
}
