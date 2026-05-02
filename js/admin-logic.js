import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Uses same settings from auth.js implicitly mapped here. Make sure firebaseConfig matches!
const firebaseConfig = {
    apiKey: "AIzaSyDIhjZxZfK3FAOfIITCG_yoceEi0gq4gAw",
    authDomain: "sparkira-stephen.firebaseapp.com",
    projectId: "sparkira-stephen",
    storageBucket: "sparkira-stephen.firebasestorage.app",
    messagingSenderId: "730230690717",
    appId: "1:730230690717:web:34bb0a3e1f80d54da8d574"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Keep this strictly identical to the one in auth.js!
const ADMIN_UIDS = ['nVpgXNS6Khfqr7NGdKxA397ZdUq2']; 

// Elements
const adminForm = document.getElementById('adminForm');
const squadKeyInput = document.getElementById('squadKey');
const globalLinkInput = document.getElementById('globalLink');
const btn = document.getElementById('saveBtn');
const alertBox = document.getElementById('adminAlert');

// Security Enforcer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Enforce admin privileges
        if (!ADMIN_UIDS.includes(user.uid)) {
            window.location.href = 'index.html'; // Kick non-admins out
            return;
        }
        
        // Fetch existing configuration from Firestore
        try {
            const configRef = doc(db, "settings", "globalConfigs");
            const configSnap = await getDoc(configRef);
            
            if (configSnap.exists()) {
                const data = configSnap.data();
                squadKeyInput.value = data.squadPublicKey || '';
                globalLinkInput.value = data.globalLink || '';
            }
        } catch (err) {
            console.error("Error fetching config:", err);
        }

    } else {
        window.location.href = 'login.html';
    }
});

// Update Configuration Logic
if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deploying...';
        btn.disabled = true;
        alertBox.classList.add('d-none');
        
        try {
            const configRef = doc(db, "settings", "globalConfigs");
            await setDoc(configRef, {
                squadPublicKey: squadKeyInput.value.trim(),
                globalLink: globalLinkInput.value.trim(),
                updatedAt: new Date().toISOString()
            }, { merge: true });
            
            alertBox.className = 'alert custom-alert bg-success bg-opacity-10 text-success border-success mt-4';
            alertBox.innerText = "System Configuration deployed globally!";
            alertBox.classList.remove('d-none');
            
        } catch (error) {
            alertBox.className = 'alert custom-alert mt-4';
            alertBox.innerText = error.message;
            alertBox.classList.remove('d-none');
        } finally {
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-2"></i>Deploy Configuration';
            btn.disabled = false;
        }
    });
}

// Log Out Handler
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    });
});
