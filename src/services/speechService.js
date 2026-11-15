/**
 * Web Speech API and Audio Synthesizer service
 */

// Check browser support
export const isSpeechRecognitionSupported = () => {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export const isSpeechSynthesisSupported = () => {
  return typeof window !== "undefined" && "speechSynthesis" in window;
};

/**
 * Creates and initializes a speech recognition instance
 */
export const createSpeechRecognition = ({
  onResult,
  onError,
  onEnd,
  lang = "auto",
}) => {
  if (!isSpeechRecognitionSupported()) {
    onError && onError(new Error("Speech recognition is not supported in this browser."));
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  if (lang === "ar" || lang === "ar-SA" || lang === "ar-EG") {
    recognition.lang = "ar-SA";
  } else if (lang === "en" || lang === "en-US") {
    recognition.lang = "en-US";
  } else {
    // Default to browser language or Arabic
    recognition.lang = navigator.language || "ar-SA";
  }

  recognition.onresult = (event) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    onResult && onResult({ finalTranscript, interimTranscript });
  };

  recognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    onError && onError(event);
  };

  recognition.onend = () => {
    onEnd && onEnd();
  };

  return recognition;
};

/**
 * Speak text using window.speechSynthesis
 */
export const speakText = (text, options = {}) => {
  if (!isSpeechSynthesisSupported()) return null;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text) return null;

  // Remove markdown symbols for cleaner voice reading
  const clean = text
    .replace(/```[\s\S]*?```/g, "Code block omitted.")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*#_~[\]()]/g, "")
    .trim();

  if (!clean) return null;

  const utterance = new SpeechSynthesisUtterance(clean);

  // Auto-detect language
  const isArabic = /[\u0600-\u06FF]/.test(clean);
  utterance.lang = isArabic ? "ar-SA" : "en-US";
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
};

export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Web Audio API synthesizer for sound effects (zero external files required)
 */
export const playSoundEffect = (type = "send") => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "send") {
      // Soft ascending pop
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "receive") {
      // Gentle chime
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "click") {
      // Subtle click
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
};
