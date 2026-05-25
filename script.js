// ── GRAB ALL ELEMENTS FROM HTML ───────────────────────────────
const inputText    = document.getElementById('inputText');
const outputBox    = document.getElementById('outputBox');
const sourceLang   = document.getElementById('sourceLang');
const targetLang   = document.getElementById('targetLang');
const translateBtn = document.getElementById('translateBtn');
const copyBtn      = document.getElementById('copyBtn');
const speakBtn     = document.getElementById('speakBtn');
const clearBtn     = document.getElementById('clearBtn');
const swapBtn      = document.getElementById('swapBtn');
const errorBox     = document.getElementById('errorBox');

// ── VARIABLE TO STORE LAST TRANSLATION ───────────────────────
let lastTranslation = '';


// ── 1. TRANSLATE FUNCTION ─────────────────────────────────────
translateBtn.addEventListener('click', async () => {

  const text = inputText.value.trim();

  // if input is empty, show error
  if (text === '') {
    showError('Please enter some text to translate.');
    return;
  }

  hideError();

  // show loading state
  outputBox.textContent = 'Translating...';
  outputBox.classList.remove('has-text');
  translateBtn.textContent = 'Translating...';
  translateBtn.disabled = true;

  const src = sourceLang.value;
  const tgt = targetLang.value;

  // build the API URL
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${tgt}`;

  try {
    // send request to API
    const response = await fetch(url);

    // convert response to JSON
    const data = await response.json();

    if (data.responseStatus === 200) {
      // SUCCESS — show the translation
      lastTranslation = data.responseData.translatedText;
      outputBox.textContent = lastTranslation;
      outputBox.classList.add('has-text');

      // enable copy and speak buttons
      copyBtn.disabled = false;
      speakBtn.disabled = false;

    } else {
      // API returned an error
      showError('Translation failed. Please try again.');
      outputBox.textContent = 'Translation will appear here...';
    }

  } catch (error) {
    // network or fetch error
    showError('Network error. Check your internet connection.');
    outputBox.textContent = 'Translation will appear here...';
  }

  // reset button
  translateBtn.textContent = 'Translate';
  translateBtn.disabled = false;

});


// ── 2. SWAP LANGUAGES ─────────────────────────────────────────
swapBtn.addEventListener('click', () => {

  const src = sourceLang.value;
  const tgt = targetLang.value;

  // swap the selected values
  sourceLang.value = tgt;
  targetLang.value = src;

  // if there was a translation, swap the text too
  if (lastTranslation) {
    inputText.value = lastTranslation;
    outputBox.textContent = 'Translation will appear here...';
    outputBox.classList.remove('has-text');
    lastTranslation = '';
    copyBtn.disabled = true;
    speakBtn.disabled = true;
  }

});


// ── 3. COPY BUTTON ────────────────────────────────────────────
copyBtn.addEventListener('click', () => {

  if (!lastTranslation) return;

  // copy text to clipboard
  navigator.clipboard.writeText(lastTranslation).then(() => {
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 2000);
  });

});


// ── 4. SPEAK BUTTON (Text-to-Speech) ─────────────────────────
speakBtn.addEventListener('click', () => {

  if (!lastTranslation) return;

  // create a speech object
  const utterance = new SpeechSynthesisUtterance(lastTranslation);
  utterance.lang = targetLang.value;  // speak in target language
  utterance.rate = 0.9;               // slightly slower speed

  // cancel any ongoing speech first
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  speakBtn.textContent = '🔊 Speaking...';
  utterance.onend = () => {
    speakBtn.textContent = 'Speak';
  };

});


// ── 5. CLEAR BUTTON ───────────────────────────────────────────
clearBtn.addEventListener('click', () => {

  inputText.value = '';
  outputBox.textContent = 'Translation will appear here...';
  outputBox.classList.remove('has-text');
  lastTranslation = '';
  copyBtn.disabled = true;
  speakBtn.disabled = true;
  hideError();

});


// ── HELPER FUNCTIONS ──────────────────────────────────────────
function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

function hideError() {
  errorBox.style.display = 'none';
}