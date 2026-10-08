const femaleVoiceName = /\b(female|woman|sonia|hazel|kate|serena|fiona|susan|jenny|aria|libby|amy|emma|olivia|salli|joanna|kendra|samantha|victoria|zira|tessa|moira|karen|siri)\b/i;

function findFemaleVoice(voices) {
  const femaleVoices = voices.filter((voice) => femaleVoiceName.test(voice.name));
  const britishFemaleVoice = femaleVoices.find((voice) => /^en[-_]?(GB|UK)\b/i.test(voice.lang));
  return britishFemaleVoice ?? femaleVoices.find((voice) => /^en\b/i.test(voice.lang)) ?? femaleVoices[0];
}

// Speaks the word with a female (preferably British) voice, reporting progress through onStatus.
export function speakWord(word, onStatus) {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    onStatus("Word audio isn’t available in this browser.");
    return;
  }

  const voice = findFemaleVoice(window.speechSynthesis.getVoices());
  if (!voice) {
    onStatus("A female voice isn’t available in this browser.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.voice = voice;
  utterance.lang = voice.lang || "en-GB";
  utterance.rate = 0.85;
  utterance.onstart = () => onStatus("Listen to the word.");
  utterance.onend = () => onStatus("");
  utterance.onerror = () => onStatus("Sorry, the word audio couldn’t be played.");

  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    onStatus("Sorry, the word audio couldn’t be played.");
  }
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

const cantoneseLang = /^(zh[-_]HK|yue)/i;
const cantoneseFemaleName = /(sinji|tracy|hiugaai|hiumaan|female|woman)/i;

function findCantoneseVoice(voices) {
  const cantonese = voices.filter((voice) => cantoneseLang.test(voice.lang) || /cantonese|粵語/i.test(voice.name));
  return cantonese.find((voice) => cantoneseFemaleName.test(voice.name)) ?? cantonese[0];
}

// Reads Chinese text aloud in Cantonese. Devices without a Cantonese voice get a message instead
// of the text being read in Mandarin or English.
export function speakCantonese(text, onStatus, retried = false) {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    onStatus("呢部機唔支援讀字。");
    return;
  }

  const voices = window.speechSynthesis.getVoices();
  // Some browsers load their voices after the page starts; wait for them once.
  if (voices.length === 0 && !retried) {
    window.speechSynthesis.addEventListener?.("voiceschanged", () => speakCantonese(text, onStatus, true), { once: true });
    return;
  }
  const voice = findCantoneseVoice(voices);
  if (!voice) {
    onStatus("呢部機未有廣東話聲音。");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang || "zh-HK";
  utterance.rate = 0.8;
  utterance.onstart = () => onStatus("聽吓呢個字。");
  utterance.onend = () => onStatus("");
  utterance.onerror = () => onStatus("讀唔到呢個字，唔好意思。");

  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    onStatus("讀唔到呢個字，唔好意思。");
  }
}
