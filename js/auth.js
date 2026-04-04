import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// TODO: Replace with your actual Firebase project config provided by the Google Firebase Console!
const firebaseConfig = {
    apiKey: "AIzaSyDIhjZxZfK3FAOfIITCG_yoceEi0gq4gAw",
    authDomain: "sparkira-stephen.firebaseapp.com",
    projectId: "sparkira-stephen",
    storageBucket: "sparkira-stephen.firebasestorage.app",
    messagingSenderId: "730230690717",
    appId: "1:730230690717:web:34bb0a3e1f80d54da8d574"
};

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Specialized Admin Array (Hardcoded configuration point for security gating)
const ADMIN_UIDS = ['nVpgXNS6Khfqr7NGdKxA397ZdUq2'];

// Functional Registration Action Hook
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('regFullName').value;
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const btn = document.getElementById('regBtn');
        const errBox = document.getElementById('regError');

        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating Account...';
        btn.disabled = true;
        errBox.classList.add('d-none');

        try {
            // Generate core user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Attach Full Name uniquely to Auth object natively
            await updateProfile(user, { displayName: fullName });

            // Commit deep username parameters to Firestore
            await setDoc(doc(db, "users", user.uid), {
                fullName: fullName,
                username: username,
                email: email,
                createdAt: new Date().toISOString()
            });

            // Redirect based on Admin status
            if (ADMIN_UIDS.includes(user.uid)) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'packages.html';
            }

        } catch (error) {
            errBox.innerText = error.message;
            errBox.classList.remove('d-none');
            btn.innerHTML = 'Sign Up <i class="fa-solid fa-arrow-right ms-2"></i>';
            btn.disabled = false;
        }
    });
}

// Functional Login Action Hook
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('logEmail').value;
        const password = document.getElementById('logPassword').value;
        const btn = document.getElementById('logBtn');
        const errBox = document.getElementById('logError');

        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging In...';
        btn.disabled = true;
        errBox.classList.add('d-none');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Redirect based on Admin status
            if (ADMIN_UIDS.includes(user.uid)) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'packages.html';
            }

        } catch (error) {
            errBox.innerText = error.message;
            errBox.classList.remove('d-none');
            btn.innerHTML = 'Log In <i class="fa-solid fa-arrow-right ms-2"></i>';
            btn.disabled = false;
        }
    });
}
