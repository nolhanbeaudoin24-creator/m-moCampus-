
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { prompt } = await request.json();

        if (!prompt || !prompt.trim()) {
            return Response.json(
                { error: "Écris une question pour commencer." },
                { status: 400 }
            );
        }

        const messages = [
            {
                role: "system",
                content: "Tu es MémoCampus IA, un assistant pédagogique bienveillant. Tu aides les élèves à comprendre leurs cours, faire leurs exercices et réviser. Réponds clairement en français."
            },
            {
                role: "user",
                content: prompt
            }
        ];

        const result = await env.AI.run(
            "@cf/google/gemma-4-26b-a4b-it",
            {
                messages,
                max_completion_tokens: 700
            }
        );

        const answer =
            result.choices?.[0]?.message?.content ||
            result.response ||
            "";

        if (!answer) {
            throw new Error("Le modèle n'a renvoyé aucune réponse.");
        }

        return Response.json({ answer });

    } catch (error) {
        return Response.json(
            {
                error: "Le serveur IA a rencontré une erreur.",
                details: error.message
            },
            { status: 500 }
        );
    }
}
