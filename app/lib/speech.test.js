import { speakWord, stopSpeaking } from "./speech";

class FakeUtterance {
  constructor(text) {
    this.text = text;
  }
}

function installSpeech(voices) {
  const synth = {
    getVoices: jest.fn(() => voices),
    speak: jest.fn(),
    cancel: jest.fn(),
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  global.SpeechSynthesisUtterance = FakeUtterance;
  return synth;
}

afterEach(() => {
  delete window.speechSynthesis;
  delete global.SpeechSynthesisUtterance;
});

describe("speakWord", () => {
  it("explains when the browser has no speech support", () => {
    const onStatus = jest.fn();
    speakWord("cat", onStatus);
    expect(onStatus).toHaveBeenCalledWith("Word audio isn’t available in this browser.");
  });

  it("explains when no female voice is available", () => {
    const synth = installSpeech([{ name: "Daniel", lang: "en-GB" }]);
    const onStatus = jest.fn();

    speakWord("cat", onStatus);

    expect(onStatus).toHaveBeenCalledWith("A female voice isn’t available in this browser.");
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it("prefers a British female voice and speaks slowly", () => {
    const sonia = { name: "Microsoft Sonia Online", lang: "en-GB" };
    const synth = installSpeech([{ name: "Samantha", lang: "en-US" }, sonia, { name: "Daniel", lang: "en-GB" }]);

    speakWord("dolphin", jest.fn());

    expect(synth.cancel).toHaveBeenCalled();
    const utterance = synth.speak.mock.calls[0][0];
    expect(utterance.text).toBe("dolphin");
    expect(utterance.voice).toBe(sonia);
    expect(utterance.lang).toBe("en-GB");
    expect(utterance.rate).toBe(0.85);
  });

  it("falls back to another English female voice", () => {
    const samantha = { name: "Samantha", lang: "en-US" };
    const synth = installSpeech([{ name: "Amelie", lang: "fr-FR" }, samantha]);

    speakWord("cat", jest.fn());

    expect(synth.speak.mock.calls[0][0].voice).toBe(samantha);
  });

  it("reports when speaking starts, ends and fails", () => {
    const synth = installSpeech([{ name: "Kate", lang: "en-GB" }]);
    const onStatus = jest.fn();

    speakWord("cat", onStatus);
    const utterance = synth.speak.mock.calls[0][0];

    utterance.onstart();
    expect(onStatus).toHaveBeenLastCalledWith("Listen to the word.");
    utterance.onend();
    expect(onStatus).toHaveBeenLastCalledWith("");
    utterance.onerror();
    expect(onStatus).toHaveBeenLastCalledWith("Sorry, the word audio couldn’t be played.");
  });

  it("reports an error if speaking throws", () => {
    const synth = installSpeech([{ name: "Kate", lang: "en-GB" }]);
    synth.speak.mockImplementation(() => {
      throw new Error("not allowed");
    });
    const onStatus = jest.fn();

    speakWord("cat", onStatus);

    expect(onStatus).toHaveBeenCalledWith("Sorry, the word audio couldn’t be played.");
  });
});

describe("stopSpeaking", () => {
  it("does nothing when speech isn't supported", () => {
    expect(() => stopSpeaking()).not.toThrow();
  });

  it("cancels any speech in progress", () => {
    const synth = installSpeech([]);
    stopSpeaking();
    expect(synth.cancel).toHaveBeenCalled();
  });
});
