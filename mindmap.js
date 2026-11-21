
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

function updateStatistics() {
    document.dispatchEvent(
        new CustomEvent("memocampus:update")
    );
}

export function initMindmap() {
    if (!mindmapList) return;

    renderMindmaps();
    createMindmapForm();
}

function createMindmapForm() {
    if (document.getElementById("mindmap-form")) return;

    const container = document.createElement("section");
    container.className = "mindmap-create";

    container.innerHTML = `
        <h2>Créer une carte mentale</h2>

        <form id="mindmap-form">
            <label for="mindmap-title">
                Titre de la carte
            </label>

            <input
                type="text"
                id="mindmap-title"
                placeholder="Exemple : Les transports"
                required
            >

            <label for="mindmap-content">
                Contenu de la carte
            </label>

            <textarea
                id="mindmap-content"
                rows="6"
                placeholder="Écris les idées principales et les informations à retenir..."
                required
            ></textarea>

            <button type="submit">
                Enregistrer la carte mentale
            </button>
        </form>
    `;

    mindmapList.parentNode.insertBefore(container, mindmapList);

    const form = container.querySelector("#mindmap-form");

    form.addEventListener("submit", event => {
        event.preventDefault();

        const title = document
            .getElementById("mindmap-title")
            .value.trim();

        const content = document
            .getElementById("mindmap-content")
            .value.trim();

        const success = createMindmap({ title, content });

        if (!success) {
            alert("Impossible d'enregistrer cette carte mentale.");
            return;
        }

        form.reset();
        alert("Carte mentale enregistrée !");
    });
}

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

    if (!result) return false;

    renderMindmaps();
    updateStatistics();

    return true;
}

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

        card.append(title, content, date, deleteButton);
        mindmapList.appendChild(card);
    });
}

export {
    renderMindmaps
};
