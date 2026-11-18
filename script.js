"use strict";

/* =====================================
   BARBER KING - COMPLETE JAVASCRIPT
   ===================================== */

// إعدادات الإدارة
const ADMIN_CODE = "KING2026";
const ADMIN_PAGE = "admin.html";

// مفتاح التخزين
const STORAGE_KEY = "barberKingReservations";
const THEME_KEY = "barberKingTheme";

// عناصر الحجز
const nameInput = document.getElementById("n");
const phoneInput = document.getElementById("p");
const serviceInput = document.getElementById("s");
const dateInput = document.getElementById("d");
const message = document.getElementById("m");

// =====================================
// 1. THEME JOUR / NUIT
// =====================================

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
        document.body.classList.contains("light-theme") ? "☀️" : "🌙";
}

function toggleTheme() {
    document.body.classList.toggle("light-theme");

    const isLight = document.body.classList.contains("light-theme");

    localStorage.setItem(
        THEME_KEY,
        isLight ? "light" : "dark"
    );

    updateThemeIcon();
}

// =====================================
// 2. RESERVATION STORAGE
// =====================================

function getReservations() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur de stockage :", error);
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
        console.error("Erreur :", error);
        return false;
    }
}

// =====================================
// 3. DATE MINIMUM
// =====================================

function initializeDate() {
    if (!dateInput) return;

    const now = new Date();

    now.setMinutes(
        now.getMinutes() - now.getTimezoneOffset()
    );

    dateInput.min = now.toISOString().slice(0, 16);
}

// =====================================
// 4. MESSAGE
// =====================================

function showMessage(text, color = "#4ade80") {
    if (!message) return;

    message.textContent = text;
    message.style.color = color;
}

// =====================================
// 5. CONFIRMER RESERVATION
// =====================================

function go() {

    if (!nameInput || !phoneInput ||
        !serviceInput || !dateInput || !message) {
        return;
    }

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

    // Téléphone marocain
    const tel = telephone.replace(/[\s()-]/g, "");

    const phoneRegex = /^(?:\+212|0)([5-7]\d{8})$/;

    if (!phoneRegex.test(tel)) {
        showMessage(
            "⚠️ Entrez un numéro marocain valide.",
            "#ff6464"
        );
        return;
    }

    // Service
    if (!service || service === "✂️ Service") {
        showMessage(
            "⚠️ Veuillez choisir un service.",
            "#ff6464"
        );
        return;
    }

    // Date
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

    // Création de réservation
    const reservation = {
        id: Date.now(),
        nom: nom,
        telephone: tel,
        service: service,
        date: date,
        statut: "En attente",
        dateCreation: new Date().toISOString()
    };

    // Enregistrement
    if (!saveReservation(reservation)) {
        showMessage(
            "❌ Erreur pendant l'enregistrement.",
            "#ff6464"
        );
        return;
    }

    showMessage(
        "✅ Réservation enregistrée avec succès ! Merci " + nom
    );

    // Réinitialisation
    nameInput.value = "";
    phoneInput.value = "";
    serviceInput.selectedIndex = 0;
    dateInput.value = "";

    initializeDate();
}

// =====================================
// 6. ADMIN - CODE SECRET
// =====================================

function openAdmin() {

    const code = prompt(
        "🔐 BARBER KING\n\nVeuillez entrer le code administrateur :"
    );

    if (code === null) return;

    if (code.trim() === ADMIN_CODE) {

        // Autorisation pour cette session
        sessionStorage.setItem("barberKingAdminAuth", "true");

        window.location.href = ADMIN_PAGE;

    } else {

        alert("❌ Code administrateur incorrect !");

    }
}

// Vérifier l'accès direct à admin.html
function checkAdminAccess() {

    const isAdminPage =
        window.location.pathname.endsWith("/admin.html") ||
        window.location.pathname.endsWith("admin.html");

    if (
        isAdminPage &&
        sessionStorage.getItem("barberKingAdminAuth") !== "true"
    ) {
        alert("🔐 Accès refusé ! Veuillez entrer le code administrateur.");

        window.location.replace("index.html");
    }
}

// =====================================
// 7. NAVIGATION
// =====================================

function initializeNavigation() {

    document.querySelectorAll('nav a[href^="#"]').forEach(link => {

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

            document.querySelectorAll("nav a").forEach(item => {
                item.classList.remove("on");
            });

            this.classList.add("on");
        });
    });
}

// =====================================
// 8. BOUTON RETOUR EN HAUT
// =====================================

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

// =====================================
// 9. INITIALISATION
// =====================================

document.addEventListener("DOMContentLoaded", function() {

    initializeTheme();
    initializeDate();
    initializeNavigation();
    initializeTopButton();
    checkAdminAccess();

    const themeButton = document.getElementById("themeToggle");

    if (themeButton) {
        themeButton.addEventListener("click", toggleTheme);
    }

});

// Fonctions accessibles depuis HTML
window.go = go;
window.openAdmin = openAdmin;
window.getReservations = getReservations;
window.toggleTheme = toggleTheme;


// ===== BARBER KING INTRO =====

window.addEventListener("load", function () {

    const intro = document.getElementById("intro");

    if (!intro) return;

    // Bloquer le scroll pendant l'introduction
    document.body.style.overflow = "hidden";

    // Masquer l'introduction après 3 secondes
    setTimeout(function () {

        intro.classList.add("hide");

        document.body.style.overflow = "";

        // Supprimer l'introduction après l'animation
        setTimeout(function () {
            intro.remove();
        }, 800);

    }, 3000);

});
