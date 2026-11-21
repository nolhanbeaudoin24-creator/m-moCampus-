
/* =========================================
   MÉMOCAMPUS — SERVEUR IA
   Cloudflare Pages Function
========================================= */

export async function onRequestPost({ request, env }) {
    try {
        // Vérifier la liaison Workers AI
        if (!env.AI) {
            return Response.json(
                { error: "Le service IA n'est pas configuré." },
                { status: 503 }
            );
        }

        // Récupérer la question
        const body = await request.json();
        const prompt =
            typeof body.prompt === "string"
                ? body.prompt.trim()
                : "";

        if (!prompt) {
            return Response.json(
                { error: "Aucune question reçue." },
                { status: 400 }
            );
        }

        if (prompt.length > 4000) {
            return Response.json(
                { error: "La question est trop longue." },
                { status: 400 }
            );
        }

        // Interroger Gemma 4
        const result = await env.AI.run(
            "@cf/google/gemma-4-26b-a4b-it",
            {
                messages: [
                    {
                        role: "system",
                        content:
                            "Tu es MémoCampus IA, un assistant pédagogique. " +
                            "Tu aides les élèves à comprendre leurs cours. " +
                            "Réponds toujours en français, clairement, " +
                            "avec des explications simples et pédagogiques."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_completion_tokens: 700
            }
        );

        // Récupérer la réponse du modèle
        const content =
            result?.choices?.[0]?.message?.content;

        let answer = "";

        if (typeof content === "string") {
            answer = content.trim();
        } else if (Array.isArray(content)) {
            answer = content
                .map(part =>
                    typeof part === "string"
                        ? part
                        : part?.text || ""
                )
                .join("")
                .trim();
        } else if (typeof result?.response === "string") {
            // Compatibilité avec un autre format de réponse
            answer = result.response.trim();
        }

        if (!answer) {
            const fields =
                result && typeof result === "object"
                    ? Object.keys(result).join(", ")
                    : typeof result;

            throw new Error(
                "Aucun texte exploitable reçu du modèle. " +
                "Champs reçus : " + (fields || "aucun")
            );
        }

        return Response.json({ answer });

    } catch (error) {
        console.error("Erreur MémoCampus IA :", error);

        return Response.json(
            {
                error: "Le serveur IA a rencontré une erreur.",
                details: error?.message || String(error)
            },
            { status: 500 }
        );
    }
}
