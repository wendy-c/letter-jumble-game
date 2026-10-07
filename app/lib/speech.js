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
