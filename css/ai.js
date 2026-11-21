    nolhanbeaudoin24-creator
    m-moCampus-

Repository navigation

    Code
    Issues
    Pull requests
    Agents
    Actions
    Projects
    Wiki
    Security and quality
    Insights
    Settings

Files
tT

    css
        ai.js
        app.js
        courses.js
        files.js
        mindmap.js
        notes.js
        progress.js
        quiz.js
        storage.js
        style.css
        websites.js
    functions
    ai.js
    app.js
    courses.js
    files.js
    index.html
    mindmap.js
    notes.js
    progress.js
    quiz.js
    storage.js
    style.css
    websites.js

    m-moCampus-/css

/
in
main

    Edit
    Preview

Indent mode
Indent size
Line wrap mode
Editing ai.js file contents
 
  1
  2
  3
  4
  5
  6
  7
  8
  9
 10
 11
 12
 13
 14
 15
 16
 17
 18
 19
 20
 21
 22
 23
 24
 25
 26
 27
 28
 29
 30
 31
 32
 33
 34
 35
 36
 37
 38
 39
 40
 41
 42
 43
 44
 45
 46
 47
 48
 49
 50
 51
 52
 53
 54
 55
 56
 57
 58
 59
 60
 61
 62
 63
 64
 65
 66
 67
 68
 69
 70
 71
 72
 73
 74
 75
 76
 77
 78
 79
 80
 81
 82
 83
 84
 85
 86
 87

/* =========================================
   MÃ‰MOCAMPUS â€” AI
   Assistant intelligent
========================================= */

const promptInput = document.getElementById("ai-prompt");
const generateButton = document.getElementById("ai-generate");
const resultArea = document.getElementById("ai-result");

let isGenerating = false;

/* INITIALISATION */

export function initAI() {
    if (!generateButton || !promptInput || !resultArea) {
        console.warn("MÃ©moCampus IA : Ã©lÃ©ments HTML introuvables.");
        return;
    }

    generateButton.addEventListener("click", generateResponse);

    promptInput.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            generateResponse();
        }
    });
}

/* GÃ‰NÃ‰RATION */

async function generateResponse() {
    if (isGenerating) return;

    const prompt = promptInput.value.trim();

    if (!prompt) {
        resultArea.textContent = "Ã‰cris une question pour commencer.";
        promptInput.focus();
        return;
    }

    isGenerating = true;
    generateButton.disabled = true;
    generateButton.textContent = "RÃ©flexion en cours...";
    resultArea.textContent = "MÃ©moCampus IA prÃ©pare une rÃ©ponse...";

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
            throw new Error("Le serveur n'a renvoyÃ© aucun texte.");
        }

        resultArea.textContent = data.answer;

    } catch (error) {
        console.error("Erreur MÃ©moCampus IA :", error);

        resultArea.textContent =
            "Diagnostic MÃ©moCampus IA : " +
            (error.message || "Erreur inconnue.");

    } finally {
        isGenerating = false;
        generateButton.disabled = false;
        generateButton.textContent = "GÃ©nÃ©rer une rÃ©ponse";
    }
}

Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.
Commit changes
There was an error committing your changes: nolhanbeaudoin24-creator has committed since you started editing. See what changed
Commit message
Extended description
Direct commit or PR
Commit directly to the

main

branch
Create a new branch for this commit and start a pull request Learn more about pull requests
