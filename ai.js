
/* =========================================
   MÉMOCAMPUS — SERVEUR IA
   Cloudflare Pages Function
========================================= */

export async function onRequestPost({ request, env }) {
    try {
        if (!env.AI) {
            return Response.json(
                { error: "Le service IA n'est pas configuré." },
                { status: 503 }
            );
        }

        const body = await request.json();
        const prompt = body.prompt?.trim();

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

        const result = await env.AI.run(
            "@cf/google/gemma-4-26b-a4b-it",
            {
                prompt:
                    "Tu es MémoCampus IA, un assistant pédagogique " +
                    "qui aide les élèves à comprendre leurs cours. " +
                    "Réponds toujours en français, clairement, " +
                    "avec des explications simples et pédagogiques.\n\n" +
                    "Question de l'élève : " + prompt,
                max_completion_tokens: 700
            }
        );

        const answer = result.response?.trim();

        if (!answer) {
            throw new Error("Aucune réponse générée.");
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
