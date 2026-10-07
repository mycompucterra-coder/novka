// ============================================
// СЦЕНА: "Фотосессия на паре"
// ============================================

console.log("[VN] Запуск...");

// Определяем тип устройства и добавляем класс к body
function detectDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(navigator.userAgent) || window.innerWidth < 768;
    document.body.classList.add(isMobile ? "mobile" : "desktop");
    console.log("[VN] Устройство:", isMobile ? "mobile" : "desktop");
}
detectDevice();

// ============================================
// СЦЕНАРИЙ
// ============================================

const script = [

    // ============ КАДР 1: вид со стороны ============
    { type: "background", file: "bg-girls-back.png", transition: "fade" },
    { type: "thoughts", text: "Скучная пара. Препод бубнит про нормализацию баз данных уже сорок минут." },
    { type: "thoughts", text: "Зато впереди — три причины, по которым я ещё не сплю." },

    // ============ КАДР 2: от первого лица ============
    { type: "background", file: "bg-pov-desk.png", transition: "fade" },
    { type: "pulse", value: true },
    { type: "thoughts", text: "Алина, Аня, Арина. Сидят, хихикают о чём-то своём." },
    { type: "thoughts", text: "Алина сидит так, что сосредоточиться на лекции — задача со звёздочкой. Очень большой звёздочкой." },
    { type: "thoughts", text: "И ведь чувствуют, что на них смотрят. Специально, что ли?" },

    // ============ КАДР 3: телефон (ZOOM) ============
    { type: "pulse", value: false },
    { type: "background", file: "bg-pov-phone.png", transition: "zoom" },
    { type: "thoughts", text: "Такой кадр упускать нельзя. Где телефон..." },
    { type: "thoughts", text: "Ага. Сейчас будет фото века." },
    { type: "thoughts", text: "Главное — без звука. Без звука, я сказал." },

    // ============ ВСПЫШКА + ТРЯСКА ============
    { type: "flash" },
    { type: "background", file: "bg-girls-turned.png", transition: "instant" },
    { type: "shake" },

    // ============ КАДР 4: обернулись ============
    { type: "thoughts", text: "Чёрт." },
    { type: "thoughts", text: "Чёрт-чёрт-чёрт. Я же НЕ на беззвучном." },

    // ============ КАДР 5: смотрят ============
    { type: "background", file: "bg-girls-staring.png", transition: "fade" },
    { type: "vignette", value: true },
    { type: "thoughts", text: "Кажется, пора валить. И желательно быстро." },

    // ============ ЧЁРНЫЙ ЭКРАН ============
    { type: "vignette", value: false },
    { type: "blackout" },
    { type: "thoughts", text: "Чёрт. Пора валить." },

    { type: "end" }
];

// ============================================
// ДВИЖОК
// ============================================

const bgEl      = document.getElementById("background");
const spriteEl  = document.getElementById("sprite-alina");
const flashEl   = document.getElementById("flash");
const vignetteEl= document.getElementById("vignette");
const boxEl     = document.getElementById("dialogue-box");
const nameEl    = document.getElementById("speaker-name");
const textEl    = document.getElementById("dialogue-text");
const choicesEl = document.getElementById("choices");
const hintEl    = document.getElementById("continue-hint");

let index = 0;
let typing = false;
let typeTimer = null;

// -------- Смена фона --------
function setBackground(file, transition) {
    const url = `url('images/backgrounds/${file}')`;

    if (transition === "instant") {
        bgEl.style.transition = "none";
        bgEl.style.transform = "scale(1)";
        bgEl.style.backgroundImage = url;
        void bgEl.offsetWidth;
        bgEl.style.transition = "opacity 0.6s ease, transform 0.6s ease";

    } else if (transition === "zoom") {
        bgEl.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        bgEl.style.opacity = "0";
        bgEl.style.transform = "scale(1.08)";

        setTimeout(() => {
            bgEl.style.backgroundImage = url;
            bgEl.style.transform = "scale(1.08)";
            void bgEl.offsetWidth;
            bgEl.style.transition = "opacity 0.5s ease, transform 0.7s ease";
            bgEl.style.opacity = "1";
            bgEl.style.transform = "scale(1)";
        }, 400);

    } else {
        bgEl.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        bgEl.style.backgroundImage = url;
        bgEl.style.transform = "scale(1)";
    }
}

// -------- Вспышка --------
function flash() {
    return new Promise(resolve => {
        flashEl.classList.add("active");
        setTimeout(() => {
            flashEl.classList.remove("active");
            setTimeout(resolve, 180);
        }, 120);
    });
}

// -------- Тряска --------
function shake() {
    return new Promise(resolve => {
        bgEl.classList.add("shaking");
        setTimeout(() => {
            bgEl.classList.remove("shaking");
            resolve();
        }, 500);
    });
}

// -------- Пульсация --------
function pulse(value) {
    if (value) bgEl.classList.add("pulsing");
    else bgEl.classList.remove("pulsing");
}

// -------- Vignette --------
function vignette(value) {
    if (value) vignetteEl.classList.add("active");
    else vignetteEl.classList.remove("active");
}

// -------- Затемнение --------
function blackout() {
    bgEl.style.transition = "opacity 0.8s ease";
    bgEl.style.backgroundImage = "none";
    bgEl.style.backgroundColor = "#000";
}

// -------- Запуск --------
startScene();

function startScene() {
    index = 0;
    step();
}

// -------- Основной цикл --------
async function step() {
    if (index >= script.length) return;
    const node = script[index];

    switch (node.type) {

        case "narration":
            showDialogue(null, node.text, false);
            break;

        case "thoughts":
            showDialogue(null, node.text, true);
            break;

        case "dialogue":
            showDialogue(node.char, node.text, false);
            break;

        case "background":
            setBackground(node.file, node.transition || "fade");
            index++;
            if (node.transition === "zoom") {
                setTimeout(() => { index++; step(); }, 900);
                return;
            }
            step();
            return;

        case "flash":
            await flash();
            index++;
            step();
            return;

        case "shake":
            await shake();
            index++;
            step();
            return;

        case "pulse":
            pulse(node.value);
            index++;
            step();
            return;

        case "vignette":
            vignette(node.value);
            index++;
            step();
            return;

        case "blackout":
            blackout();
            index++;
            step();
            return;

        case "end":
            endScene();
            return;
    }

    index++;
}

// -------- Диалог --------
function showDialogue(character, text, isThoughts) {
    choicesEl.classList.add("hidden");
    hintEl.style.visibility = "hidden";

    if (isThoughts) {
        boxEl.classList.add("thoughts");
    } else {
        boxEl.classList.remove("thoughts");
    }

    nameEl.textContent = "";
    nameEl.style.display = "none";

    typeText(text);
}

// -------- Печать по буквам --------
function typeText(text) {
    clearInterval(typeTimer);
    typing = true;
    textEl.textContent = "";
    let i = 0;

    typeTimer = setInterval(() => {
        textEl.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(typeTimer);
            typing = false;
            hintEl.style.visibility = "visible";
        }
    }, 25);
}

// -------- Пропуск печати --------
function skipTyping() {
    if (typing) {
        clearInterval(typeTimer);
        typing = false;
        const node = script[index - 1];
        if (node && node.text) textEl.textContent = node.text;
        hintEl.style.visibility = "visible";
        return true;
    }
    return false;
}

// -------- Конец сцены --------
function endScene() {
    nameEl.style.display = "none";
    boxEl.classList.remove("thoughts");
    textEl.textContent = "— Конец сцены —";
    hintEl.style.visibility = "hidden";
    boxEl.onclick = null;
    boxEl.style.cursor = "default";
}

// -------- Клик / тап по диалогу --------
// Используем click — он работает и на телефоне как tap
boxEl.addEventListener("click", (e) => {
    if (!choicesEl.classList.contains("hidden")) return;
    if (skipTyping()) return;
    step();
});

// Предотвращаем двойной тап-зум на мобильных
document.addEventListener("touchstart", (e) => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });