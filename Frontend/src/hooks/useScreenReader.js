export function speak(text, options = {}) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = options.rate || 0.85;

  function pickBestVoice() {
    const voices = window.speechSynthesis.getVoices();

    // Prefer these well-tested, natural-sounding voices in order
    const preferred = [
      'Google US English',        // Chrome — best quality, most natural
      'Google UK English Female', // Chrome — clear female voice
      'Microsoft Aria Online (Natural) - English (United States)', // Edge — very natural
      'Microsoft Jenny Online (Natural) - English (United States)', // Edge — natural female
      'Samantha',                 // macOS/iOS — clear and natural
      'Karen',                    // macOS Australian — clear
      'Daniel',                   // macOS UK — clear male
    ];

    for (const name of preferred) {
      const match = voices.find(v => v.name === name);
      if (match) { utterance.voice = match; break; }
    }

    // If none of the preferred found, just use the first English voice
    if (!utterance.voice) {
      const fallback = voices.find(v => v.lang.startsWith('en'));
      if (fallback) utterance.voice = fallback;
    }

    window.speechSynthesis.speak(utterance);
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      pickBestVoice();
    };
  } else {
    pickBestVoice();
  }
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}
