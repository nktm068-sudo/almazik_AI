const API_KEY = 'AIzaSyBgqjWWcNRx24EuHnbWckYARujnwZHsDu4';

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

// 2. Озвучка текста
function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    
    utterance.onstart = () => orb.classList.add('active');
    utterance.onend = () => orb.classList.remove('active');
    
    synth.speak(utterance);
}

// 3. Запрос к Gemini AI
async function askGemini(text) {
    statusText.textContent = "Алмазик думает...";
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com{API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Ты ИИ Алмазик. Отвечай кратко (до 2 предложений). Вопрос: ${text}` }] }]
            })
        });
        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        addMessage('Алмазик', aiText, true);
        speak(aiText);
        statusText.textContent = "Алмазик ответил";
    } catch (e) {
        addMessage('Система', 'Ошибка подключения к ИИ.');
        statusText.textContent = "Ошибка";
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

// 5. Голосовой ввод (Web Speech API)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';

    orb.onclick = () => recognition.start();
    
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
    statusText.textContent = "Голос не поддерживается";
}
