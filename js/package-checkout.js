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
let dynamicPaystackKey = null;
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
                dynamicPaystackKey = data.paystackPublicKey;
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
        const finalPaystackKey = dynamicPaystackKey || "pk_live_96e0c2a82c83cd09dc9dad7895c3ee918f0c542a";

        // Initialize Paystack SDK integration securely
        let handler = PaystackPop.setup({
            key: finalPaystackKey,
            email: currentUser.email,
            amount: parseFloat(amount) * 100, // Paystack uses kobo (kobo = NGN * 100)
            currency: "NGN",
            ref: `SPARKIRA_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            channels: ['bank_transfer', 'card', 'bank', 'ussd', 'qr', 'mobile_money'],
            metadata: {
                custom_fields: [
                    {
                        display_name: "Package",
                        variable_name: "package",
                        value: pkgName
                    },
                    {
                        display_name: "Customer Name",
                        variable_name: "customer_name",
                        value: currentUser.displayName || "Sparkira User"
                    }
                ]
            },
            callback: function(response) {
                // Route deeply upon validation
                console.log("Payment successful:", response);
                window.location.href = dynamicGlobalLink;
            },
            onClose: function() {
                console.log("Payment window closed");
                alertBox.className = 'alert custom-alert text-warning border-warning';
                alertBox.innerText = 'Payment window closed or cancelled.';
                alertBox.classList.remove('d-none');
            }
        });
        handler.openIframe();
    });
});

// Log Out Handler
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    });
});
