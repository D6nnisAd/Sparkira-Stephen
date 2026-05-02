import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

// Globals fetched from Admin Settings
let dynamicSquadKey = null;
let dynamicGlobalLink = "#";
let currentUser = null;

// Auth gating
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('userWelcome').innerText = `Welcome, ${user.displayName || 'Sparkira Earner'}`;
        
        // Fetch globally deployed variables from Firestore securely
        try {
            const configRef = doc(db, "settings", "globalConfigs");
            const configSnap = await getDoc(configRef);
            if (configSnap.exists()) {
                const data = configSnap.data();
                dynamicSquadKey = data.squadPublicKey;
                dynamicGlobalLink = data.globalLink;
                
                // Update support link natively!
                document.getElementById('supportLink').href = dynamicGlobalLink;
            } else {
                console.warn('Admin configurations not set!');
            }
        } catch (error) {
            console.error('Error hydrating secure contexts', error);
        }
        
    } else {
        window.location.href = 'login.html';
    }
});

// Configure Checkout Engine
document.querySelectorAll('.checkout-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Prevent double firing if clicking button inside the card 
        e.stopPropagation();
        
        const amount = this.getAttribute('data-amount');
        const pkgName = this.getAttribute('data-pkg');
        const alertBox = document.getElementById('paymentAlert');
        
        alertBox.classList.add('d-none');

        // Failsafes
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        // Provide a massive fallback if the DB hasn't been configured or Firestore rules block read access
        const finalSquadKey = dynamicSquadKey || "pk_4300b63695833202ef2658af4f435d80de024ac6";

        // Initialize SquadCo SDK integration securely
        const squadInstance = new squad({
            onClose: () => console.log("Widget closed"),
            onLoad: () => console.log("Widget loaded successfully"),
            onSuccess: (response) => {
                // Route deeply upon validation
                console.log("Payment successful:", response);
                window.location.href = dynamicGlobalLink;
            },
            // Required parameters
            key: finalSquadKey,
            email: currentUser.email,
            amount: parseFloat(amount) * 100, // SquadCo expects amount in Kobo (Naira * 100)
            currency_code: "NGN",
            transaction_ref: `SPARKIRA_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            metadata: {
                package: pkgName,
                customerName: currentUser.displayName || "Sparkira User"
            }
        });

        squadInstance.setup();
        squadInstance.open();
    });
});

// Log Out Handler
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    });
});
