
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();

        const incomingMessages = body.messages;

        if (
            !Array.isArray(incomingMessages) ||
            incomingMessages.length === 0
        ) {
            return Response.json(
                { error: "Écris un message pour commencer." },
                { status: 400 }
            );
        }

        const messages = incomingMessages
            .slice(-20)
            .filter(message =>
                message &&
                ["user", "assistant"].includes(message.role) &&
                typeof message.content === "string" &&
                message.content.trim().length > 0
            )
            .map(message => ({
                role: message.role,
                content: message.content.slice(0, 12000)
            }));

        if (
            messages.length === 0 ||
            messages[messages.length - 1].role !== "user"
        ) {
            return Response.json(
                { error: "Le dernier message doit être une question." },
                { status: 400 }
            );
        }

        const systemMessage = {
            role: "system",
            content:
                "Tu es MémoCampus IA, un assistant pédagogique " +
                "bienveillant. Tu aides les élèves à comprendre " +
                "leurs cours, faire leurs exercices et réviser. " +
                "Réponds clairement en français."
        };

        const result = await env.AI.run(
            "@cf/google/gemma-4-26b-a4b-it",
            {
                messages: [
                    systemMessage,
                    ...messages
                ],
                max_completion_tokens: 700
            }
        );

        const answer =
            result.choices?.[0]?.message?.content ||
            result.response ||
            "";

        if (!answer) {
            throw new Error(
                "Le modèle n'a renvoyé aucune réponse."
            );
        }

        return Response.json({ answer });

    } catch (error) {
        console.error("Erreur MémoCampus IA :", error);

        return Response.json(
            {
                error: "Le serveur IA a rencontré une erreur.",
                details: error.message
            },
            { status: 500 }
        );
    }
}
