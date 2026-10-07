const param = () => ({ value: 0, setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() });
const node = (extra = {}) => ({ connect: jest.fn((target) => target), ...extra });

function installFakeAudio() {
  const started = [];
  class FakeAudioContext {
    constructor() {
      this.currentTime = 0;
      this.sampleRate = 100;
      this.state = "suspended";
      this.destination = node();
      this.resume = jest.fn(() => {
        this.state = "running";
      });
    }
    createOscillator() {
      return node({ type: "sine", frequency: param(), start: jest.fn(() => started.push("tone")), stop: jest.fn() });
    }
    createGain() {
      return node({ gain: param() });
    }
    createBiquadFilter() {
      return node({ type: "lowpass", frequency: param(), Q: param() });
    }
    createBufferSource() {
      return node({ start: jest.fn(() => started.push("noise")), stop: jest.fn() });
    }
    createBuffer(channels, length) {
      return { getChannelData: () => new Float32Array(length) };
    }
    createDynamicsCompressor() {
      return node();
    }
  }
  window.AudioContext = FakeAudioContext;
  return started;
}

afterEach(() => {
  delete window.AudioContext;
  jest.resetModules();
});

describe("sounds", () => {
  it("does nothing where Web Audio isn't available", () => {
    const { sounds } = require("./sounds");
    expect(() => sounds.correct()).not.toThrow();
  });

  it("plays every sound effect without errors", () => {
    const started = installFakeAudio();
    const { sounds } = require("./sounds");

    Object.entries(sounds).forEach(([name, play]) => {
      const before = started.length;
      expect(() => play()).not.toThrow();
      expect({ name, played: started.length > before }).toEqual({ name, played: true });
    });
  });

  it("plays a rising chime for a correct answer", () => {
    const started = installFakeAudio();
    const { sounds } = require("./sounds");
    sounds.correct();
    expect(started.filter((kind) => kind === "tone").length).toBeGreaterThanOrEqual(4);
  });
});
