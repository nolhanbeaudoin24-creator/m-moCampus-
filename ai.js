
/* =========================================
   MÉMOCAMPUS — AI
   Assistant intelligent avec conversations
========================================= */

import {
    getConversations,
    addConversation,
    updateConversation
} from "./storage.js";

const promptInput = document.getElementById("ai-prompt");
const generateButton = document.getElementById("ai-generate");
const messagesArea = document.getElementById("ai-messages");
const conversationsList = document.getElementById("ai-conversations-list");
const newChatButton = document.getElementById("ai-new-chat");

let isGenerating = false;
let currentConversationId = null;

/* =========================================
   INITIALISATION
========================================= */

export function initAI() {
    if (
        !promptInput ||
        !generateButton ||
        !messagesArea ||
        !conversationsList ||
        !newChatButton
    ) {
        console.error(
            "MémoCampus IA : éléments HTML introuvables."
        );
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
        const button = event.target.closest("[data-conversation-id]");

        if (!button) return;

        openConversation(button.dataset.conversationId);
    });

    renderConversationList();

    const conversations = getSortedConversations();

    if (conversations.length > 0) {
        openConversation(conversations[0].id);
    } else {
        showWelcomeMessage();
    }

    console.log("MémoCampus IA : assistant initialisé.");
}

/* =========================================
   TRI DES CONVERSATIONS
========================================= */

function getSortedConversations() {
    return [...getConversations()].sort((a, b) => {
        return new Date(b.updatedAt || b.createdAt || 0) -
               new Date(a.updatedAt || a.createdAt || 0);
    });
}

/* =========================================
   NOUVELLE CONVERSATION
========================================= */

function startNewConversation() {
    if (isGenerating) return;

    currentConversationId = null;

    promptInput.value = "";

    showWelcomeMessage();
    renderConversationList();

    promptInput.focus();
}

/* =========================================
   MESSAGE DE BIENVENUE
========================================= */

function showWelcomeMessage() {
    messagesArea.replaceChildren();

    const welcome = document.createElement("div");
    welcome.className = "ai-welcome-message";

    const title = document.createElement("h3");
    title.textContent = "Bonjour !";

    const paragraph = document.createElement("p");
    paragraph.textContent =
        "Je suis MémoCampus IA. Pose-moi une question, " +
        "demande-moi une explication ou prépare tes révisions.";

    welcome.append(title, paragraph);
    messagesArea.appendChild(welcome);
}

/* =========================================
   AFFICHAGE DES MESSAGES
========================================= */

function renderMessages(messages = []) {
    messagesArea.replaceChildren();

    if (messages.length === 0) {
        showWelcomeMessage();
        return;
    }

    for (const message of messages) {
        addMessageToScreen(message.role, message.content);
    }

    scrollMessagesToBottom();
}

function addMessageToScreen(role, content) {
    const message = document.createElement("div");

    message.className =
        role === "user"
            ? "ai-message ai-user-message"
            : "ai-message ai-assistant-message";

    const label = document.createElement("strong");

    label.textContent =
        role === "user"
            ? "Toi"
            : "MémoCampus IA";

    const text = document.createElement("p");
    text.textContent = content;

    message.append(label, text);
    messagesArea.appendChild(message);

    scrollMessagesToBottom();

    return message;
}

function scrollMessagesToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

/* =========================================
   AFFICHAGE DE L'HISTORIQUE
========================================= */

function renderConversationList() {
    conversationsList.replaceChildren();

    const conversations = getSortedConversations();

    if (conversations.length === 0) {
        const empty = document.createElement("p");

        empty.className = "ai-empty-history";
        empty.textContent = "Tes conversations apparaîtront ici.";

        conversationsList.appendChild(empty);
        return;
    }

    for (const conversation of conversations) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "ai-history-item";
        button.dataset.conversationId = conversation.id;

        if (conversation.id === currentConversationId) {
            button.classList.add("active");
        }

        button.textContent = conversation.title || "Nouvelle conversation";

        conversationsList.appendChild(button);
    }
}

/* =========================================
   OUVERTURE D'UNE CONVERSATION
========================================= */

function openConversation(id) {
    if (isGenerating) return;

    const conversation = getConversations().find(
        item => item.id === id
    );

    if (!conversation) return;

    currentConversationId = id;

    promptInput.value = "";

    renderMessages(conversation.messages || []);
    renderConversationList();
}

/* =========================================
   CRÉATION ET SAUVEGARDE
========================================= */

function createConversation(firstMessage) {
    const title = firstMessage.length > 45
        ? firstMessage.slice(0, 45) + "..."
        : firstMessage;

    const conversation = addConversation({
        title,
        messages: [],
        updatedAt: new Date().toISOString()
    });

    if (!conversation) {
        throw new Error(
            "Impossible d'enregistrer la conversation."
        );
    }

    currentConversationId = conversation.id;

    return conversation;
}

function saveConversation(conversation) {
    const success = updateConversation(
        conversation.id,
        {
            title: conversation.title,
            messages: conversation.messages,
            updatedAt: new Date().toISOString()
        }
    );

    if (!success) {
        throw new Error(
            "Impossible de sauvegarder les messages."
        );
    }

    renderConversationList();
}

/* =========================================
   INDICATEUR DE RÉFLEXION
========================================= */

function showThinkingMessage() {
    const thinking = document.createElement("div");

    thinking.className =
        "ai-message ai-assistant-message ai-thinking";

    thinking.textContent =
        "MémoCampus IA prépare une réponse...";

    messagesArea.appendChild(thinking);

    scrollMessagesToBottom();

    return thinking;
}

/* =========================================
   GÉNÉRATION DE LA RÉPONSE
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
    generateButton.textContent = "Réflexion...";

    promptInput.disabled = true;

    let thinkingMessage = null;

    try {
        let conversation = getConversations().find(
            item => item.id === currentConversationId
        );

        if (!conversation) {
            conversation = createConversation(prompt);
        }

        conversation.messages = [
            ...(conversation.messages || []),
            {
                role: "user",
                content: prompt
            }
        ];

        saveConversation(conversation);

        promptInput.value = "";

        renderMessages(conversation.messages);

        thinkingMessage = showThinkingMessage();

        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: conversation.messages.slice(-20)
            })
        });

        const contentType =
            response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            throw new Error(
                "Réponse serveur invalide. Code HTTP : " +
                response.status
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
            throw new Error(
                "Le serveur n'a renvoyé aucune réponse."
            );
        }

        conversation.messages.push({
            role: "assistant",
            content: data.answer
        });

        // Limite la taille de l'historique conservé.
        if (conversation.messages.length > 100) {
            conversation.messages =
                conversation.messages.slice(-100);
        }

        saveConversation(conversation);

        renderMessages(conversation.messages);

    } catch (error) {
        console.error("Erreur MémoCampus IA :", error);

        if (thinkingMessage) {
            thinkingMessage.remove();
        }

        const errorMessage = document.createElement("div");

        errorMessage.className = "ai-error-message";
        errorMessage.textContent =
            "Erreur : " + (error.message || "Erreur inconnue.");

        messagesArea.appendChild(errorMessage);

        scrollMessagesToBottom();

    } finally {
        isGenerating = false;

        generateButton.disabled = false;
        generateButton.textContent = "Envoyer";

        promptInput.disabled = false;
        promptInput.focus();
    }
}
