import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- Firebase Configuration ---
 const firebaseConfig = {
    apiKey: "AIzaSyCpAkYkSdsWkuNItiMQDXhNdMqoxSVy13A",
    authDomain: "mozan-76e7f.firebaseapp.com",
    projectId: "mozan-76e7f",
    storageBucket: "mozan-76e7f.firebasestorage.app",
    messagingSenderId: "985866702235",
    appId: "1:985866702235:web:2f0553ada762050d8ce53e",
    measurementId: "G-KWE32SGRE7"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- GSAP Lamp Pull Cord Logic ---
gsap.registerPlugin(Draggable);

const root = document.documentElement;
const body = document.body;
const loginForm = document.querySelector(".login-form");

const cordBead = document.querySelector(".cord-bead");
const cordLine = document.querySelector(".cord-line");
const hitArea = document.querySelector(".cord-hit");

let isOn = false;

const clickSound = new Audio("https://assets.codepen.io/605876/click.mp3");

Draggable.create(hitArea, {
  type: "y",
  bounds: { minY: 0, maxY: 60 },

  onDrag() {
    gsap.set(cordBead, { y: this.y });
    gsap.set(cordLine, { attr: { y2: 180 + this.y } });
  },

  onRelease() {
    if (this.y > 30) {
      toggleLamp();
    }

    gsap.to([cordBead, hitArea], {
      y: 0,
      duration: 0.5,
      ease: "back.out(2.5)",
    });

    gsap.to(cordLine, {
      attr: { y2: 180 },
      duration: 0.5,
      ease: "back.out(2.5)",
    });
  },
});

function toggleLamp() {
  isOn = !isOn;
  clickSound.play();

  body.setAttribute("data-on", isOn);
  root.style.setProperty("--on", isOn ? 1 : 0);

  if (isOn) {
    loginForm.classList.add("active");
    gsap.to(body, { backgroundColor: "#1c1f24", duration: 0.6 });
  } else {
    loginForm.classList.remove("active");
    gsap.to(body, { backgroundColor: "#121417", duration: 0.6 });
  }
}

// --- Firebase Authentication & Firestore Logic ---
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const errorMsg = document.getElementById("error-message");

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}

// 1. Sign In Existing User
loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError("Please fill in both email and password.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "home.html";
  } catch (error) {
    showError(error.message.replace("Firebase: ", ""));
  }
});

// 2. Sign Up New User and Save to Firestore
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError("Please fill in both email and password.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save record to 'users' collection in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp()
    });

    window.location.href = "home.html";
  } catch (error) {
    showError(error.message.replace("Firebase: ", ""));
  }
});