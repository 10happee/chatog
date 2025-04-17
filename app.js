// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

// Send message
window.sendMessage = () => {
  const input = document.getElementById("message-input");
  const text = input.value;
  if (text.trim()) {
    push(messagesRef, { text });
    input.value = "";
  }
};

// Listen for new messages
onChildAdded(messagesRef, (snapshot) => {
  const chatBox = document.getElementById("chat-box");
  const msg = snapshot.val();
  const p = document.createElement("p");
  p.textContent = msg.text;
  chatBox.appendChild(p);
});
