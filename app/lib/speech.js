const femaleVoiceName = /\b(female|woman|sonia|hazel|kate|serena|fiona|susan|jenny|aria|libby|amy|emma|olivia|salli|joanna|kendra|samantha|victoria|zira|tessa|moira|karen|siri)\b/i;

// Chrome adds Google's online voices (e.g. "Google UK English Female"), which play over the
// network and often fail silently. Voices built into the device are tried first.
function builtInFirst(voices) {
  return [...voices.filter((voice) => voice.localService !== false), ...voices.filter((voice) => voice.localService === false)];
}

function findFemaleVoice(voices) {
  const femaleVoices = builtInFirst(voices.filter((voice) => femaleVoiceName.test(voice.name)));
  const britishFemaleVoice = femaleVoices.find((voice) => /^en[-_]?(GB|UK)\b/i.test(voice.lang));
  return britishFemaleVoice ?? femaleVoices.find((voice) => /^en\b/i.test(voice.lang)) ?? femaleVoices[0];
}

// The utterance being spoken. Chrome can garbage-collect an utterance nothing refers to,
// cutting it off or never playing it, so we hold on to it until it finishes.
let currentUtterance = null;

// Hands an utterance to the browser, working around Chrome's speech bugs:
// - Chrome silently drops an utterance spoken straight after cancel(), so we only cancel
//   when something is actually playing, and then wait a moment before speaking.
// - Chrome can leave speech paused (e.g. after the tab was in the background); resume() un-sticks it.
function play(utterance, onFailure) {
  const synth = window.speechSynthesis;
  const busy = synth.speaking || synth.pending;
  if (busy) synth.cancel();
  currentUtterance = utterance;
  const release = () => {
    if (currentUtterance === utterance) currentUtterance = null;
  };
  utterance.addEventListener?.("end", release);
  utterance.addEventListener?.("error", release);

  const speak = () => {
    // Stopped, or replaced by another word, while we waited.
    if (currentUtterance !== utterance) return;
    try {
      synth.resume?.();
      synth.speak(utterance);
    } catch {
      release();
      onFailure();
    }
  };
  if (busy) setTimeout(speak, 100);
  else speak();
}

// Browsers can load their voices after the page starts. Returns false (and calls `retry`
// once they arrive) when there are none yet.
function voicesReady(retried, retry) {
  if (retried || window.speechSynthesis.getVoices().length > 0 || !window.speechSynthesis.addEventListener) return true;
  window.speechSynthesis.addEventListener("voiceschanged", retry, { once: true });
  return false;
}

// Cancelling or interrupting (e.g. tapping again) isn't a failure worth reporting.
function isRealError(event) {
  return event?.error !== "canceled" && event?.error !== "interrupted";
}

// Speaks the word with a female (preferably British) voice, reporting progress through onStatus.
export function speakWord(word, onStatus, retried = false) {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    onStatus("Word audio isn’t available in this browser.");
    return;
  }
  if (!voicesReady(retried, () => speakWord(word, onStatus, true))) return;

  const voice = findFemaleVoice(window.speechSynthesis.getVoices());
  if (!voice) {
    onStatus("A female voice isn’t available in this browser.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.voice = voice;
  utterance.lang = voice.lang || "en-GB";
  utterance.rate = 0.85;
  utterance.onstart = () => onStatus("Listen to the word.");
  utterance.onend = () => onStatus("");
  utterance.onerror = (event) => {
    if (isRealError(event)) onStatus("Sorry, the word audio couldn’t be played.");
  };
  play(utterance, () => onStatus("Sorry, the word audio couldn’t be played."));
}

export function stopSpeaking() {
  currentUtterance = null;
  window.speechSynthesis?.cancel();
}

const cantoneseLang = /^(zh[-_]HK|yue)/i;
const cantoneseFemaleName = /(sinji|tracy|hiugaai|hiumaan|female|woman)/i;

function findCantoneseVoice(voices) {
  const cantonese = builtInFirst(voices.filter((voice) => cantoneseLang.test(voice.lang) || /cantonese|粵語/i.test(voice.name)));
  return cantonese.find((voice) => cantoneseFemaleName.test(voice.name)) ?? cantonese[0];
}

// Reads Chinese text aloud in Cantonese. Devices without a Cantonese voice get a message instead
// of the text being read in Mandarin or English.
export function speakCantonese(text, onStatus, retried = false) {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    onStatus("呢部機唔支援讀字。");
    return;
  }

  if (!voicesReady(retried, () => speakCantonese(text, onStatus, true))) return;

  const voice = findCantoneseVoice(window.speechSynthesis.getVoices());
  if (!voice) {
    onStatus("呢部機未有廣東話聲音。");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang || "zh-HK";
  utterance.rate = 0.8;
  utterance.onstart = () => onStatus("聽吓呢個字。");
  utterance.onend = () => onStatus("");
  utterance.onerror = (event) => {
    if (isRealError(event)) onStatus("讀唔到呢個字，唔好意思。");
  };
  play(utterance, () => onStatus("讀唔到呢個字，唔好意思。"));
}
