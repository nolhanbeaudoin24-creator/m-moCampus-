
/* =========================================
   MÉMOCAMPUS — AI
   Assistant intelligent et conversations
========================================= */

import {
    getConversations,
    addConversation,
    updateConversation
} from "./storage.js";

let isGenerating = false;
let currentConversationId = null;

let promptInput;
let generateButton;
let messagesArea;
let conversationsList;
let newChatButton;

/* =========================================
   INITIALISATION
========================================= */

export function initAI() {
    promptInput = document.getElementById("ai-prompt");
    generateButton = document.getElementById("ai-generate");
    messagesArea = document.getElementById("ai-messages");
    conversationsList = document.getElementById("ai-conversations-list");
    newChatButton = document.getElementById("ai-new-chat");

    if (
        !promptInput ||
        !generateButton ||
        !messagesArea ||
        !conversationsList ||
        !newChatButton
    ) {
        console.error("MémoCampus IA : éléments HTML introuvables.");
        return;
    }

    generateButton.addEventListener("click", generateResponse);

    promptInput.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            generateResponse();
        }
    });

    newChatButton.addEventListener("click", startNewConversation);

    conversationsList.addEventListener("click", event => {
        const item = event.target.closest("[data-conversation-id]");

        if (item) {
            openConversation(item.dataset.conversationId);
        }
    });

    renderConversationHistory();

    const conversations = getConversations();

    if (conversations.length > 0) {
        const latest = [...conversations].sort(
            (a, b) =>
                new Date(b.updatedAt || b.createdAt) -
                new Date(a.updatedAt || a.createdAt)
        )[0];

        openConversation(latest.id);
    } else {
        showWelcomeMessage();
    }

    console.log("MémoCampus IA : initialisée.");
}

/* =========================================
   NOUVELLE CONVERSATION
========================================= */

function startNewConversation() {
    currentConversationId = null;
    promptInput.value = "";

    showWelcomeMessage();
    renderConversationHistory();

    promptInput.focus();
}

/* =========================================
   CRÉATION D'UNE CONVERSATION
========================================= */

function createConversation(firstMessage) {
    const conversation = {
        id: crypto.randomUUID(),
        title: firstMessage.slice(0, 45),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const saved = addConversation(conversation);

    if (!saved) {
        throw new Error("Impossible d'enregistrer la conversation.");
    }

    currentConversationId = saved.id;

    return saved;
}

/* =========================================
   MESSAGE D'ACCUEIL
========================================= */

function showWelcomeMessage() {
    messagesArea.replaceChildren();

    const welcome = document.createElement("div");
    welcome.className = "ai-welcome-message";

    const title = document.createElement("h3");
    title.textContent = "Bonjour !";

    const description = document.createElement("p");

    description.textContent =
        "Je suis MémoCampus IA. Pose-moi une question, demande-moi une explication ou prépare tes révisions.";

    welcome.append(title, description);
    messagesArea.appendChild(welcome);
}

/* =========================================
   AFFICHAGE DES MESSAGES
========================================= */

function renderMessages(conversation) {
    messagesArea.replaceChildren();

    if (!conversation || !conversation.messages?.length) {
        showWelcomeMessage();
        return;
    }

    conversation.messages.forEach(message => {
        const bubble = document.createElement("div");

        bubble.className =
            message.role === "user"
                ? "ai-message ai-user-message"
                : "ai-message ai-assistant-message";

        bubble.textContent = message.content || "";

        messagesArea.appendChild(bubble);
    });

    messagesArea.scrollTop = messagesArea.scrollHeight;
}

/* =========================================
   HISTORIQUE DES CONVERSATIONS
========================================= */

function renderConversationHistory() {
    conversationsList.replaceChildren();

    const conversations = [...getConversations()].sort(
        (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
    );

    if (conversations.length === 0) {
        const empty = document.createElement("p");

        empty.className = "ai-empty-history";
        empty.textContent = "Tes conversations apparaîtront ici.";

        conversationsList.appendChild(empty);
        return;
    }

    conversations.forEach(conversation => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "ai-history-item";
        button.dataset.conversationId = conversation.id;

        button.textContent =
            conversation.title || "Nouvelle conversation";

        if (conversation.id === currentConversationId) {
            button.classList.add("active");
        }

        conversationsList.appendChild(button);
    });
}

/* =========================================
   OUVRIR UNE CONVERSATION
========================================= */

function openConversation(id) {
    const conversation = getConversations().find(
        item => item.id === id
    );

    if (!conversation) return;

    currentConversationId = id;

    renderMessages(conversation);
    renderConversationHistory();
}

/* =========================================
   INDICATEUR DE RÉFLEXION
========================================= */

function showThinkingIndicator() {
    const indicator = document.createElement("div");

    indicator.className = "ai-message ai-thinking";
    indicator.textContent = "MémoCampus IA prépare une réponse...";

    messagesArea.appendChild(indicator);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

/* =========================================
   ENVOI ET GÉNÉRATION DE RÉPONSE
========================================= */

async function generateResponse() {
    if (isGenerating) return;

    const prompt = promptInput.value.trim();

    if (!prompt) {
        promptInput.focus();
        return;
    }

    isGenerating = true;

    generateButton.disabled = true;
    generateButton.textContent = "Réflexion en cours...";
    promptInput.disabled = true;

    try {
        let conversation = getConversations().find(
            item => item.id === currentConversationId
        );

        if (!conversation) {
            conversation = createConversation(prompt);
        }

        conversation.messages.push({
            role: "user",
            content: prompt
        });

        conversation.title =
            conversation.title || prompt.slice(0, 45);

        conversation.updatedAt = new Date().toISOString();

        const saved = updateConversation(conversation.id, {
            messages: conversation.messages,
            title: conversation.title,
            updatedAt: conversation.updatedAt
        });

        if (!saved) {
            throw new Error("Impossible de sauvegarder ton message.");
        }

        promptInput.value = "";

        renderMessages(conversation);
        showThinkingIndicator();
        renderConversationHistory();

        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        const contentType =
            response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            throw new Error(
                "Le serveur n'a pas renvoyé une réponse JSON."
            );
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.details ||
                data.error ||
                "Erreur HTTP " + response.status
            );
        }

        if (!data.answer) {
            throw new Error("Aucune réponse reçue du serveur.");
        }

        conversation.messages.push({
            role: "assistant",
            content: data.answer
        });

        conversation.updatedAt = new Date().toISOString();

        updateConversation(conversation.id, {
            messages: conversation.messages,
            updatedAt: conversation.updatedAt
        });

        renderMessages(conversation);
        renderConversationHistory();

    } catch (error) {
        console.error("Erreur MémoCampus IA :", error);

        const errorMessage = document.createElement("div");

        errorMessage.className = "ai-error-message";
        errorMessage.textContent =
            "Erreur : " + (error.message || "Erreur inconnue.");

        messagesArea.appendChild(errorMessage);

    } finally {
        isGenerating = false;

        generateButton.disabled = false;
        generateButton.textContent = "Envoyer";
        promptInput.disabled = false;

        promptInput.focus();
    }
}
