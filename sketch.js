import { MidiParser } from "./node_modules/midi-parser-js/src/midi-parser.js";

// Canvas Dimensions
let w;
let h;

// MIDI Data
let noteTracks;
let midiArray;

// Piano meta
let piano;
const numOfKeys = 88;
const startKey = 21;
let tempoEvents;
let ppq;

// Animation frames
let frameSkip = 0;
let frameCounter = 0;
let fps = 60;

function preload() {
  midiArray = loadJSON("./assets/lyrith.json", (data) => {
    noteTracks = interpretMidiEvents(data);
    tempoEvents = getTempoEvents(data);
    ppq = data.timeDivision;
  });
}

function setup() {
  updateHW();
  createCanvas(w, h);
  frameRate(fps);
  piano = new Piano(startKey, startKey + numOfKeys - 1, [85, 0, 85]);
}

function draw() {
  const uspb = checkCurrentTempo(tempoEvents, frameCounter);
  frameSkip = Math.round((1000000 * ppq) / (uspb * fps));

  frameCounter += frameSkip;
  piano.updateKeyboardState(noteTracks, frameCounter);
  if (frameCounter % frameSkip === 0) {
    background(24);
    piano.show();
    piano.drawKeyboardState();
  }
}

function windowResized() {
  updateHW();
  resizeCanvas(w, h);
  piano.updateDimensions();
}

function updateHW() {
  w = window.innerWidth * 0.95;
  h = w > 1000 ? window.innerHeight * 0.9 : (9 * w) / 16;
}

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
