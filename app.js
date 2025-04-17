// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded, get, remove, child
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// 🔧 Your Firebase Config Here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

// 🧹 Delete messages older than 24h on page load
const now = Date.now();
const ONE_DAY = 24 * 60 * 60 * 1000;

get(messagesRef).then(snapshot => {
  snapshot.forEach(childSnap => {
    const msg = childSnap.val();
    if (msg.timestamp && now - msg.timestamp > ONE_DAY) {
      remove(child(messagesRef, childSnap.key));
    }
  });
});

// 📨 Realtime listener
onChildAdded(messagesRef, (snapshot) => {
  const chatBox = document.getElementById("chat-box");
  const msg = snapshot.val();
  const p = document.createElement("p");
  p.textContent = msg.text;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// 📝 Send message
window.sendMessage = () => {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (text) {
    push(messagesRef, {
      text,
      timestamp: Date.now()
    });
    input.value = "";
  }
};

// ⏎ Enter key support
document.getElementById("message-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
