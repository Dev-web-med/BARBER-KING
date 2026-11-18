
"use strict";

/* ==========================================
   BARBER KING - JAVASCRIPT AVEC FIREBASE
   ========================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ==========================================
   1. CONFIGURATION FIREBASE
   ========================================== */

const firebaseConfig = {
    apiKey: "AIzaSyD4It5yeetfMYcUTGWiFhaw6XBRcX4QhCw",
    authDomain: "barber-king-48.firebaseapp.com",
    projectId: "barber-king-48",
    storageBucket: "barber-king-48.firebasestorage.app",
    messagingSenderId: "842889696983",
    appId: "1:842889696983:web:1e5b7d8adba5b9419c0292"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* ==========================================
   2. PARAMÈTRES
   ========================================== */

const ADMIN_CODE = "KING2026";
const ADMIN_PAGE = "admin.html";

const STORAGE_KEY = "barberKingReservations";
const THEME_KEY = "barberKingTheme";


/* ==========================================
   3. ÉLÉMENTS HTML
   ========================================== */

const nameInput = document.getElementById("n");
const phoneInput = document.getElementById("p");
const serviceInput = document.getElementById("s");
const dateInput = document.getElementById("d");
const message = document.getElementById("m");


/* ==========================================
   4. GESTION DU THÈME
   ========================================== */

function initializeTheme() {

    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    }

    updateThemeIcon();
}

function updateThemeIcon() {

    const themeButton = document.getElementById("themeToggle");

    if (!themeButton) return;

    themeButton.textContent =
        document.body.classList.contains("light-theme")
            ? "☀️"
            : "🌙";
}

function toggleTheme() {

    document.body.classList.toggle("light-theme");

    const isLight =
        document.body.classList.contains("light-theme");

    localStorage.setItem(
        THEME_KEY,
        isLight ? "light" : "dark"
    );

    updateThemeIcon();
}


/* ==========================================
   5. GESTION DES RÉSERVATIONS LOCALES
   ========================================== */

function getReservations() {

    try {

        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {

        console.error("Erreur localStorage :", error);

        return [];
    }
}

function saveReservation(reservation) {

    const reservations = getReservations();

    reservations.push(reservation);

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(reservations)
        );

        return true;

    } catch (error) {

        console.error("Erreur sauvegarde :", error);

        return false;
    }
}


/* ==========================================
   6. INITIALISATION DE LA DATE
   ========================================== */

function initializeDate() {

    if (!dateInput) return;

    const now = new Date();

    now.setMinutes(
        now.getMinutes() - now.getTimezoneOffset()
    );

    dateInput.min = now.toISOString().slice(0, 16);
}


/* ==========================================
   7. AFFICHAGE DES MESSAGES
   ========================================== */

function showMessage(text, color = "#4ade80") {

    if (!message) return;

    message.textContent = text;
    message.style.color = color;
}


/* ==========================================
   8. FONCTION DE RÉSERVATION
   ========================================== */

async function go() {

    if (
        !nameInput ||
        !phoneInput ||
        !serviceInput ||
        !dateInput ||
        !message
    ) return;

    const nom = nameInput.value.trim();
    const telephone = phoneInput.value.trim();
    const service = serviceInput.value;
    const date = dateInput.value;

    showMessage("");

    // Vérification du nom
    if (nom.length < 3) {

        showMessage(
            "⚠️ Veuillez entrer votre nom complet.",
            "#ff6464"
        );

        return;
    }

    // Vérification du téléphone marocain
    const tel = telephone.replace(/[\s()-]/g, "");

    const phoneRegex = /^(?:\+212|0)([5-7]\d{8})$/;

    if (!phoneRegex.test(tel)) {

        showMessage(
            "⚠️ Entrez un numéro marocain valide.",
            "#ff6464"
        );

        return;
    }

    // Vérification du service
    if (!service || service === "✂️ Service") {

        showMessage(
            "⚠️ Veuillez choisir un service.",
            "#ff6464"
        );

        return;
    }

    // Vérification de la date
    if (!date) {

        showMessage(
            "⚠️ Veuillez choisir une date.",
            "#ff6464"
        );

        return;
    }

    const reservationDate = new Date(date);

    if (
        isNaN(reservationDate.getTime()) ||
        reservationDate <= new Date()
    ) {

        showMessage(
            "⚠️ Veuillez choisir une date future.",
            "#ff6464"
        );

        return;
    }

    // Création de la réservation
    const reservation = {

        id: Date.now(),

        nom: nom,

        telephone: tel,

        service: service,

        date: date,

        statut: "En attente",

        dateCreation: new Date().toISOString()
    };

    // Sauvegarde locale
    const saved = saveReservation(reservation);

    if (!saved) {

        showMessage(
            "⚠️ Impossible de sauvegarder la réservation localement.",
            "#ff6464"
        );

        return;
    }

    // Enregistrement Firebase
    try {

        await addDoc(
            collection(db, "bookings"),
            {
                ...reservation,
                createdAt: serverTimestamp()
            }
        );

        showMessage(
            "✅ Réservation enregistrée avec succès ! Merci " + nom,
            "#4ade80"
        );

        // Vider le formulaire
        nameInput.value = "";
        phoneInput.value = "";
        serviceInput.selectedIndex = 0;
        dateInput.value = "";

        initializeDate();

    } catch (error) {

        console.error("Erreur Firebase :", error);

        showMessage(
            "⚠️ Réservation enregistrée localement, mais synchronisation Firebase impossible.",
            "#ff6464"
        );
    }
}


/* ==========================================
   9. ACCÈS ADMINISTRATEUR
   ========================================== */

function openAdmin() {

    const code = prompt(
        "🔐 BARBER KING\n\nVeuillez entrer le code administrateur :"
    );

    if (code === null) return;

    if (code.trim() === ADMIN_CODE) {

        sessionStorage.setItem(
            "barberKingAdminAuth",
            "true"
        );

        window.location.href = ADMIN_PAGE;

    } else {

        alert("❌ Code administrateur incorrect !");
    }
}


/* ==========================================
   10. VÉRIFICATION ADMIN
   ========================================== */

function checkAdminAccess() {

    const currentPage =
        window.location.pathname.split("/").pop().toLowerCase();

    if (
        currentPage === "admin.html" &&
        sessionStorage.getItem("barberKingAdminAuth") !== "true"
    ) {

        alert(
            "🔐 Accès refusé ! Veuillez entrer le code administrateur."
        );

        window.location.replace("index.html");
    }
}


/* ==========================================
   11. NAVIGATION
   ========================================== */

function initializeNavigation() {

    document.querySelectorAll('nav a[href^="#"]')
        .forEach(link => {

            link.addEventListener("click", function(event) {

                const targetId = this.getAttribute("href");

                if (targetId === "#") return;

                const target = document.querySelector(targetId);

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                document.querySelectorAll("nav a")
                    .forEach(item => item.classList.remove("on"));

                this.classList.add("on");
            });
        });
}


/* ==========================================
   12. BOUTON RETOUR EN HAUT
   ========================================== */

function initializeTopButton() {

    const button = document.querySelector(".topbtn");

    if (!button) return;

    button.addEventListener("click", function() {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });
}


/* ==========================================
   13. ANIMATION INTRODUCTION
   ========================================== */

function initializeIntro() {

    const intro = document.getElementById("intro");

    if (!intro) return;

    document.body.style.overflow = "hidden";

    setTimeout(function() {

        intro.classList.add("hide");

        document.body.style.overflow = "";

        setTimeout(function() {

            intro.remove();

        }, 800);

    }, 3000);
}


/* ==========================================
   14. INITIALISATION GÉNÉRALE
   ========================================== */

document.addEventListener("DOMContentLoaded", function() {

    initializeTheme();

    initializeDate();

    initializeNavigation();

    initializeTopButton();

    checkAdminAccess();

    initializeIntro();

    // Bouton de changement de thème
    const themeButton =
        document.getElementById("themeToggle");

    if (themeButton) {

        themeButton.addEventListener(
            "click",
            toggleTheme
        );
    }

});


/* ==========================================
   15. FONCTIONS ACCESSIBLES HTML
   ========================================== */

window.go = go;

window.openAdmin = openAdmin;

window.getReservations = getReservations;

window.toggleTheme = toggleTheme;
