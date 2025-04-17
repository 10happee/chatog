import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Your Firebase config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Send message function
window.sendMessage = () => {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (text !== "") {
    console.log("Sending message:", text); // Debugging log
    const messageRef = ref(db, "messages/" + Date.now());
    set(messageRef, {
      text: text,
      timestamp: Date.now()
    }).then(() => {
      input.value = "";
    }).catch((error) => {
      console.error("Error sending message:", error);
    });
  }
};

// Display messages
const chatBox = document.getElementById("chat-box");
const messagesRef = ref(db, "messages");

onValue(messagesRef, (snapshot) => {
  const messages = snapshot.val();
  chatBox.innerHTML = ""; // Clear old messages
  if (messages) {
    Object.keys(messages).forEach((key) => {
      const msg = messages[key];
      const p = document.createElement("p");
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      p.textContent = `[${time}] ${msg.text}`;
      chatBox.appendChild(p);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

// Enter key shortcut
document.getElementById("message-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
