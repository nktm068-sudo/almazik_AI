// Твой новый рабочий ключ
const API_KEY = 'AIzaSyAjbpr2SCTZls83n_ejF50Z_MVQ2LoLPI8';

const orb = document.getElementById('orb');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statusText = document.getElementById('status');

// 1. Добавление сообщений в чат
function addMessage(sender, text, isAi = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg ' + (isAi ? 'ai' : 'user');
    msgDiv.innerHTML = `<b>${sender}:</b> ${text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 2. Озвучка текста (Голос Алмазика)
function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    
    utterance.onstart = () => orb.classList.add('active');
    utterance.onend = () => orb.classList.remove('active');
    
    synth.speak(utterance);
}

// 3. Запрос к Gemini AI (Мозги)
async function askGemini(text) {
    // ВАЖНО: Исправленный URL со всеми слэшами
    const url = `https://generativelanguage.googleapis.com{API_KEY}`;
    
    statusText.textContent = "Алмазик думает...";
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Ты — ИИ помощник Алмазик. Отвечай кратко и дружелюбно. Вопрос: ${text}` }]
                }]
            })
        });

        const data = await response.json();

        // Проверка, если Google вернул ошибку (например, из-за VPN или ключа)
        if (data.error) {
            console.error("Ошибка от Google:", data.error.message);
            addMessage('Система', 'Google отклонил запрос. Проверь VPN или ключ.');
            statusText.textContent = "Ошибка API";
            return;
        }

        // Извлекаем текст из ответа Gemini
        const aiText = data.candidates[0].content.parts[0].text;
        
        addMessage('Алмазик', aiText, true);
        speak(aiText);
        statusText.textContent = "Алмазик ответил";

    } catch (e) {
        console.error("Ошибка сети:", e);
        addMessage('Система', 'Ошибка сети. Убедись, что VPN (v2rayTun) включен!');
        statusText.textContent = "Ошибка сети";
    }
}

// 4. Текстовый ввод
function handleSend() {
    const text = userInput.value.trim();
    if (text) {
        addMessage('Вы', text);
        askGemini(text);
        userInput.value = '';
    }
}

sendBtn.onclick = handleSend;
userInput.onkeypress = (e) => { if(e.key === 'Enter') handleSend(); };

// 5. Голосовой ввод (Микрофон)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';

    orb.onclick = () => {
        try {
            recognition.start();
        } catch (e) {
            console.log("Распознавание уже запущено");
        }
    };
    
    recognition.onstart = () => {
        orb.classList.add('active');
        statusText.textContent = "Слушаю...";
    };

    recognition.onresult = (event) => {
        orb.classList.remove('active');
        const speechText = event.results[0][0].transcript;
        addMessage('Вы (голос)', speechText);
        askGemini(speechText);
    };

    recognition.onerror = () => {
        orb.classList.remove('active');
        statusText.textContent = "Не расслышал...";
    };
} else {
    statusText.textContent = "Голос не поддерживается в этом браузере";
}
