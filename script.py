from pyscript import window, document, when
import js # Импорт связи с JavaScript

status_el = document.getElementById("status")
text_el = document.getElementById("user-text")

@when("click", "#start-btn")
def start_talking(event):
    status_el.innerText = "Слушаю..."
    js.js_listen() # Вызываем функцию из нашего voice.js

@when("processSpeech", "window")
def handle_speech(event):
    user_input = event.detail
    text_el.innerText = f"Вы: {user_input}"
    
    # Твой API-ключ можно использовать здесь для обработки текста через нейросеть
    reply = f"Я услышал: {user_input}. Мой ответ скоро будет готов!"
    
    # Если хочешь простые команды:
    if "кто ты" in user_input.lower():
        reply = "Я Алмазик, твой кристальный помощник."
    
    status_el.innerText = "Алмазик говорит..."
    js.js_speak(reply) # Вызываем озвучку из voice.js
