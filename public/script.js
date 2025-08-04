import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  getFirestore, collection,
  addDoc, query, orderBy, onSnapshot,
  getDocs, deleteDoc
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBaewdWJirALtcbkznG7oS1MlsHgL5eul8",
  authDomain: "cloud-chat-app-8079e.firebaseapp.com",
  projectId: "cloud-chat-app-8079e",
  storageBucket: "cloud-chat-app-8079e.appspot.com",
  messagingSenderId: "213742975260",
  appId: "1:213742975260:web:206acc033a6b7b5434e2d9"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const messagesRef = collection(db, "messages");

// Expose globally
window.signUp = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await createUserWithEmailAndPassword(auth, email, password);
  window.location.href = "chat.html";
};

window.signIn = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await signInWithEmailAndPassword(auth, email, password);
  window.location.href = "chat.html";
};

window.signOut = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

window.sendMessage = async () => {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message && auth.currentUser) {
    await addDoc(messagesRef, {
      text: message,
      timestamp: new Date(),
      user: auth.currentUser.email
    });
    input.value = "";
  }
};

window.clearChat = async () => {
  if (!auth.currentUser) return;

  const confirmation = confirm("Are you sure you want to delete all messages?");
  if (!confirmation) return;

  const q = query(messagesRef);
  const snapshot = await getDocs(q);

  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  messages.innerHTML = ""; // Clear UI
};

// Page-specific logic
const currentPath = window.location.pathname;
if (currentPath.endsWith("chat.html")) {
  onAuthStateChanged(auth, user => {
    if (user) {
      listenForMessages();
    } else {
      window.location.href = "index.html";
    }
  });

  function listenForMessages() {
    const messagesDiv = document.getElementById("messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    onSnapshot(q, snapshot => {
      messagesDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        messagesDiv.innerHTML += `<p><strong>${data.user}</strong>: ${data.text}</p>`;
      });
    });
  }
}
