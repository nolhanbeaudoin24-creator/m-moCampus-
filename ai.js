
/* =========================================
   MÉMOCAMPUS — AI
   Assistant intelligent
========================================= */

const promptInput = document.getElementById("ai-prompt");
const generateButton = document.getElementById("ai-generate");
const resultArea = document.getElementById("ai-result");

let isGenerating = false;

/* =========================================
   INITIALISATION
========================================= */

export function initAI() {
    if (!promptInput || !generateButton || !resultArea) {
        console.error(
            "MémoCampus IA : éléments HTML introuvables.",
            {
                promptInput,
                generateButton,
                resultArea
            }
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

    console.log("MémoCampus IA : bouton initialisé.");
}

/* =========================================
   GÉNÉRATION DE LA RÉPONSE
========================================= */

async function generateResponse() {
    if (isGenerating) return;

    const prompt = promptInput.value.trim();

    if (!prompt) {
        resultArea.textContent = "Écris une question pour commencer.";
        promptInput.focus();
        return;
    }

    isGenerating = true;

    generateButton.disabled = true;
    generateButton.textContent = "Réflexion en cours...";

    resultArea.textContent =
        "MémoCampus IA prépare une réponse...";

    try {
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

        resultArea.textContent = data.answer;

    } catch (error) {
        console.error("Erreur MémoCampus IA :", error);

        resultArea.textContent =
            "Diagnostic IA : " +
            (error.message || "Erreur inconnue.");

    } finally {
        isGenerating = false;

        generateButton.disabled = false;
        generateButton.textContent = "Générer une réponse";
    }
}
