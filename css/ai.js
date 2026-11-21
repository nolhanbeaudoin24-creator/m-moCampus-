
/* =========================================
   MÉMOCAMPUS — AI
   Assistant intelligent
========================================= */

let isGenerating = false;

export function initAI() {
    const promptInput = document.getElementById("ai-prompt");
    const generateButton = document.getElementById("ai-generate");
    const resultArea = document.getElementById("ai-result");

    if (!promptInput || !generateButton || !resultArea) {
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

    console.log("MémoCampus IA : bouton initialisé.");

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
        resultArea.textContent = "MémoCampus IA prépare une réponse...";

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt })
            });

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

            resultArea.textContent = data.answer;

        } catch (error) {
            console.error("Erreur MémoCampus IA :", error);

            resultArea.textContent =
                "Erreur IA : " +
                (error.message || "Erreur inconnue.");

        } finally {
            isGenerating = false;
            generateButton.disabled = false;
            generateButton.textContent = "Générer une réponse";
        }
    }
}
