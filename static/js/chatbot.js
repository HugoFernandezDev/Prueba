document.addEventListener("DOMContentLoaded", () => {
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatbotWindow = document.getElementById("chatbot-window");
    const chatbotClose = document.getElementById("chatbot-close");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotSend = document.getElementById("chatbot-send");

    // Función para mostrar/ocultar el chat
    const toggleChatWindow = () => {
        chatbotWindow.classList.toggle("hidden");
        // Enfocar el input cuando se abre
        if (!chatbotWindow.classList.contains("hidden")) {
            chatbotInput.focus();
        }
    };

    // Event listeners para abrir/cerrar
    chatbotToggle.addEventListener("click", toggleChatWindow);
    chatbotClose.addEventListener("click", toggleChatWindow);

    // Función para añadir mensaje a la UI
    const addMessage = (text, sender) => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("flex");

        const textDiv = document.createElement("div");
        textDiv.textContent = text;
        textDiv.classList.add("p-2", "rounded-lg", "max-w-[80%]");

        if (sender === "user") {
            messageDiv.classList.add("justify-end"); // Alinear a la derecha
            textDiv.classList.add("bg-amber-500", "text-white");
        } else {
            // sender === 'bot'
            textDiv.classList.add("bg-gray-200", "text-gray-800");
        }

        messageDiv.appendChild(textDiv);
        chatbotMessages.appendChild(messageDiv);

        // Auto-scroll hacia el último mensaje
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    // Función para enviar mensaje al backend
    const sendMessage = async () => {
        const messageText = chatbotInput.value.trim();
        if (!messageText) return; // No enviar mensajes vacíos

        // 1. Mostrar mensaje del usuario en la UI
        addMessage(messageText, "user");
        chatbotInput.value = ""; // Limpiar input

        // (Opcional) Mostrar indicador de "escribiendo..."
        addMessage("...", "bot"); // Placeholder temporal
        const thinkingMessage = chatbotMessages.lastChild; // Guardar referencia al mensaje "..."

        try {
            // 2. Enviar mensaje al endpoint /chatbot
            const response = await fetch("/chatbot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: messageText }),
            });

            // 3. Quitar el indicador "..."
            thinkingMessage.remove();

            if (!response.ok) {
                // Si hay un error HTTP (ej. 500)
                const errorData = await response.json();
                addMessage(errorData.response || "Error en el servidor.", "bot");
                console.error("Error from server:", response.status, errorData);
                return;
            }

            // 4. Procesar y mostrar respuesta del bot
            const data = await response.json();
            if (data.response) {
                addMessage(data.response, "bot");
            } else {
                addMessage("No se recibió respuesta.", "bot");
            }

        } catch (error) {
            // Error de red o al procesar JSON
             if (thinkingMessage) thinkingMessage.remove(); // Quitar "..." si falla la red
            console.error("Error sending message:", error);
            addMessage("No se pudo conectar con el asistente. Revisa tu conexión.", "bot");
        }
    };

    // Event listener para el botón de enviar
    chatbotSend.addEventListener("click", sendMessage);

    // Event listener para enviar con la tecla Enter
    chatbotInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});
    
