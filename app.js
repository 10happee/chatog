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

  // Enter to send message functionality
  const messageInput = document.getElementById("message-input");
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      sendMessage();
    }
  });
}

window.startChat = startChat;

// Send message
function sendMessage() {
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
    input.value = ""; // Clear input after sending
  }
}

window.sendMessage = sendMessage;

// Display messages
const chatBox = document.getElementById("chat-box");
const messagesRef = ref(db, "messages");

let lastMessageKey = null;

function listenForMessages() {
  onValue(messagesRef, (snapshot) => {
    const messages = snapshot.val();
    chatBox.innerHTML = "";
    if (messages) {
      const keys = Object.keys(messages).sort();
      const latestKey = keys[keys.length - 1];
      keys.forEach((key) => {
        const msg = messages[key];
        const p = document.createElement("p");
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        p.textContent = `[${time}] ${msg.username || "Unknown"}: ${msg.text}`;
        chatBox.appendChild(p);
      });
      chatBox.scrollTop = chatBox.scrollHeight;

      // Play sound if a new message came in
      if (lastMessageKey && latestKey !== lastMessageKey) {
        const sound = document.getElementById("ping-sound");
        const volume = parseFloat(document.getElementById("volume-slider").value);
        sound.volume = volume;
        sound.play();
      }
      lastMessageKey = latestKey;
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
