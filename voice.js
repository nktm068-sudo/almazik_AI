// Настройка распознавания речи
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'ru-RU';
recognition.interimResults = false;

// Функция, которую будет вызывать Python для запуска прослушки
function js_listen() {
    try {
        recognition.start();
        console.log("Микрофон включен");
    } catch (e) {
        console.log("Микрофон уже работает");
    }
}

// Когда браузер понял слова, он перекидывает их в Python
recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    console.log("Распознано:", text);
    
    // Создаем событие, которое поймает наш script.py
    const eventCustom = new CustomEvent("processSpeech", { detail: text });
    window.dispatchEvent(eventCustom);
};

// Функция озвучки текста
function js_speak(text) {
    const synth = window.speechSynthesis;
    // Остановка текущей речи, если она есть
    synth.cancel(); 
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ru-RU';
    utter.pitch = 1.2; // Немного повысим голос для "алмазного" эффекта
    utter.rate = 1.0;
    
    synth.speak(utter);
}
