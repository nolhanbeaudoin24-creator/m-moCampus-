
/* =========================================
   MÉMOCAMPUS — MINDMAP
   Gestion des cartes mentales
========================================= */

import {
    getCollection,
    addItem,
    deleteItem
} from "./storage.js";

const mindmapList = document.getElementById("mindmap-list");

/* =========================================
   MISE À JOUR DES STATISTIQUES
========================================= */

function updateStatistics() {
    document.dispatchEvent(
        new CustomEvent("memocampus:update")
    );
}

/* =========================================
   INITIALISATION
========================================= */

export function initMindmap() {
    if (!mindmapList) {
        console.warn("MémoCampus : liste des cartes mentales introuvable.");
        return;
    }

    const form = document.getElementById("mindmap-form");

    if (form && !form.dataset.initialized) {
        form.dataset.initialized = "true";

        form.addEventListener("submit", event => {
            event.preventDefault();

            const title = document
                .getElementById("mindmap-title")
                .value.trim();

            const content = document
                .getElementById("mindmap-content")
                .value.trim();

            if (!title || !content) {
                alert("Complète le titre et le contenu de ta carte.");
                return;
            }

            const success = createMindmap({
                title,
                content
            });

            if (!success) {
                alert("Impossible d'enregistrer cette carte mentale.");
                return;
            }

            form.reset();

            alert("Ta carte mentale a été enregistrée !");
        });
    }

    renderMindmaps();
}

/* =========================================
   CRÉATION D'UNE CARTE
========================================= */

export function createMindmap(data) {
    const title = String(data?.title || "").trim();
    const content = String(data?.content || "").trim();

    if (!title || !content) {
        return false;
    }

    const result = addItem("mindmaps", {
        title,
        content,
        createdAt: new Date().toISOString()
    });

    if (!result) {
        return false;
    }

    renderMindmaps();
    updateStatistics();

    return true;
}

/* =========================================
   AFFICHAGE DES CARTES
========================================= */

function renderMindmaps() {
    if (!mindmapList) return;

    const mindmaps = getCollection("mindmaps");

    mindmapList.innerHTML = "";

    if (!mindmaps.length) {
        mindmapList.innerHTML = `
            <p class="empty-message">
                Aucune carte mentale pour le moment.
            </p>
        `;
        return;
    }

    mindmaps.forEach(mindmap => {
        const card = document.createElement("article");
        card.className = "mindmap-card";

        const title = document.createElement("h3");
        title.textContent = mindmap.title || "Sans titre";

        const content = document.createElement("p");
        content.textContent = mindmap.content || "";

        const date = document.createElement("small");

        const createdAt = new Date(mindmap.createdAt);

        date.textContent = Number.isNaN(createdAt.getTime())
            ? ""
            : createdAt.toLocaleDateString("fr-FR");

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Supprimer";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {
            if (!confirm("Supprimer cette carte mentale ?")) {
                return;
            }

            deleteItem("mindmaps", mindmap.id);

            renderMindmaps();
            updateStatistics();
        });

        card.append(
            title,
            content,
            date,
            deleteButton
        );

        mindmapList.appendChild(card);
    });
}

/* =========================================
   EXPORT
========================================= */

export {
    renderMindmaps
};
