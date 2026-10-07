// Cute sound effects made with the Web Audio API, so there are no audio files to load.
// Every sound is a no-op where Web Audio isn't available (older browsers, tests).

let context = null;
let output = null;
let noiseBuffer = null;

function audio() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!context) {
    context = new AudioContextClass();
    const compressor = context.createDynamicsCompressor();
    output = context.createGain();
    output.gain.value = 0.7;
    output.connect(compressor);
    compressor.connect(context.destination);
  }
  // Browsers start audio suspended until a tap; every sound is triggered by one.
  if (context.state === "suspended") context.resume();
  return context;
}

function getNoise(ac) {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function envelope(ac, gain, start, duration, peak, attack = 0.01) {
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
}

// A single note. `slide` glides the pitch; `vibrato` wobbles it (for Mochi's voice).
function tone(ac, { freq, at = 0, duration = 0.2, type = "sine", volume = 0.2, slide, vibrato, attack }) {
  const start = ac.currentTime + at;
  const oscillator = ac.createOscillator();
  const gain = ac.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);
  if (slide) oscillator.frequency.exponentialRampToValueAtTime(slide, start + duration);
  if (vibrato) {
    const lfo = ac.createOscillator();
    const depth = ac.createGain();
    lfo.frequency.value = vibrato.rate;
    depth.gain.value = vibrato.depth;
    lfo.connect(depth).connect(oscillator.frequency);
    lfo.start(start);
    lfo.stop(start + duration);
  }
  envelope(ac, gain, start, duration, volume, attack);
  oscillator.connect(gain).connect(output);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

// Filtered noise: crunches, whooshes, swishes and roars.
function noise(ac, { at = 0, duration = 0.2, volume = 0.2, filter = "bandpass", freq = 1000, sweepTo, q = 1, attack }) {
  const start = ac.currentTime + at;
  const source = ac.createBufferSource();
  source.buffer = getNoise(ac);
  source.loop = true;
  const shaper = ac.createBiquadFilter();
  shaper.type = filter;
  shaper.frequency.setValueAtTime(freq, start);
  if (sweepTo) shaper.frequency.exponentialRampToValueAtTime(sweepTo, start + duration);
  shaper.Q.value = q;
  const gain = ac.createGain();
  envelope(ac, gain, start, duration, volume, attack);
  source.connect(shaper).connect(gain).connect(output);
  source.start(start, Math.random() * 0.5);
  source.stop(start + duration + 0.05);
}

function play(fn) {
  return (...args) => {
    const ac = audio();
    if (!ac) return;
    try {
      fn(ac, ...args);
    } catch {
      // Sound is a nice-to-have; never let it break the game.
    }
  };
}

const notes = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A4: 440, G4: 392, E4: 329.63, C4: 261.63 };

export const sounds = {
  // A rising, sparkly "ta-da" for a correct answer.
  correct: play((ac) => {
    ["C5", "E5", "G5", "C6"].forEach((note, index) => {
      tone(ac, { freq: notes[note], at: index * 0.09, duration: 0.35, type: "triangle", volume: 0.22 });
    });
    [notes.E6, notes.G6].forEach((freq, index) => tone(ac, { freq, at: 0.38 + index * 0.07, duration: 0.5, volume: 0.1 }));
  }),

  coin: play((ac) => {
    tone(ac, { freq: notes.B5, duration: 0.08, type: "square", volume: 0.08 });
    tone(ac, { freq: notes.E6, at: 0.08, duration: 0.3, type: "square", volume: 0.08 });
  }),

  // Mochi's happy little voice.
  coo: play((ac, pitch = 1) => {
    tone(ac, { freq: 620 * pitch, slide: 900 * pitch, duration: 0.18, volume: 0.16, vibrato: { rate: 18, depth: 25 } });
    tone(ac, { freq: 900 * pitch, slide: 700 * pitch, at: 0.16, duration: 0.25, volume: 0.14, vibrato: { rate: 18, depth: 25 } });
  }),

  chomp: play((ac) => {
    [0, 0.17, 0.34].forEach((at) => noise(ac, { at, duration: 0.09, volume: 0.35, freq: 1400, q: 1.2, attack: 0.004 }));
  }),

  slurp: play((ac) => {
    noise(ac, { duration: 0.55, volume: 0.25, freq: 500, sweepTo: 2600, q: 6, attack: 0.05 });
    noise(ac, { at: 0.6, duration: 0.35, volume: 0.2, freq: 700, sweepTo: 2200, q: 6, attack: 0.04 });
  }),

  whee: play((ac) => {
    noise(ac, { duration: 1.2, volume: 0.18, freq: 300, sweepTo: 3000, q: 2, attack: 0.3 });
    tone(ac, { freq: 500, slide: 1400, duration: 0.7, volume: 0.15, vibrato: { rate: 12, depth: 20 } });
  }),

  // A bouncy tune for the happy dance.
  danceTune: play((ac) => {
    const tune = ["C5", "E5", "G5", "E5", "F5", "A5", "G5", "E5", "D5", "F5", "E5", "C5", "G5", "G5", "C6"];
    tune.forEach((note, index) => tone(ac, { freq: notes[note], at: index * 0.18, duration: 0.16, type: "square", volume: 0.07 }));
    [0, 0.72, 1.44, 2.16].forEach((at) => tone(ac, { freq: notes.C4, at, duration: 0.3, type: "triangle", volume: 0.18 }));
  }),

  giggle: play((ac) => {
    for (let index = 0; index < 7; index += 1) {
      const pitch = 1 + Math.random() * 0.3;
      tone(ac, { freq: 900 * pitch, slide: 1300 * pitch, at: index * 0.14, duration: 0.1, volume: 0.13, vibrato: { rate: 30, depth: 40 } });
    }
  }),

  roar: play((ac) => {
    noise(ac, { duration: 1.6, volume: 0.45, filter: "lowpass", freq: 300, sweepTo: 1600, q: 1, attack: 0.15 });
    noise(ac, { at: 0.2, duration: 1.3, volume: 0.25, freq: 2400, q: 0.6, attack: 0.2 });
    tone(ac, { freq: 140, slide: 90, duration: 1.4, type: "sawtooth", volume: 0.08, attack: 0.1 });
  }),

  gasp: play((ac) => {
    noise(ac, { duration: 0.45, volume: 0.15, freq: 900, sweepTo: 1800, q: 1.5, attack: 0.2 });
  }),

  shiver: play((ac) => {
    tone(ac, { freq: 220, duration: 1.8, type: "triangle", volume: 0.12, vibrato: { rate: 22, depth: 30 } });
    for (let index = 0; index < 6; index += 1) {
      tone(ac, { freq: 2000 + Math.random() * 1500, at: 0.2 + index * 0.25, duration: 0.25, volume: 0.06 });
    }
  }),

  swish: play((ac) => {
    noise(ac, { duration: 0.35, volume: 0.22, freq: 2500, sweepTo: 5000, q: 1.5, attack: 0.08 });
  }),

  bubbles: play((ac, count = 10) => {
    for (let index = 0; index < count; index += 1) {
      const freq = 500 + Math.random() * 900;
      tone(ac, { freq, slide: freq * 1.8, at: Math.random() * 2.4, duration: 0.07, volume: 0.12 });
    }
  }),

  rub: play((ac) => {
    for (let index = 0; index < 8; index += 1) {
      noise(ac, { at: index * 0.27, duration: 0.22, volume: 0.15, freq: 800, sweepTo: 1600, q: 0.8, attack: 0.08 });
    }
  }),

  sparkle: play((ac) => {
    ["C6", "E6", "G6", "E6", "G6"].forEach((note, index) => tone(ac, { freq: notes[note], at: index * 0.07, duration: 0.4, volume: 0.07 }));
  }),

  purr: play((ac) => {
    noise(ac, { duration: 1.2, volume: 0.18, filter: "lowpass", freq: 180, q: 4, attack: 0.15 });
    tone(ac, { freq: 70, duration: 1.2, type: "triangle", volume: 0.12, vibrato: { rate: 24, depth: 8 }, attack: 0.15 });
  }),

  float: play((ac) => {
    ["C5", "E5", "G5", "B5", "D6"].forEach((note, index) => tone(ac, { freq: notes[note], at: index * 0.16, duration: 0.6, volume: 0.08 }));
  }),

  brush: play((ac) => {
    noise(ac, { duration: 0.3, volume: 0.14, freq: 1800, sweepTo: 900, q: 2, attack: 0.05 });
  }),

  // A tinkly music box waltz for ballet.
  musicBox: play((ac) => {
    const tune = ["E5", "G5", "C6", "B5", "G5", "E5", "D5", "F5", "B5", "A5", "F5", "D5", "C5", "E5", "G5", "C6"];
    tune.forEach((note, index) => {
      const at = index * 0.27;
      tone(ac, { freq: notes[note], at, duration: 0.9, volume: 0.1, attack: 0.005 });
      tone(ac, { freq: notes[note] * 2, at, duration: 0.5, volume: 0.03, attack: 0.005 });
    });
  }),
};
