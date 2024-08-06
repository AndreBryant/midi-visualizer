import { MidiParser } from "./node_modules/midi-parser-js/src/midi-parser.js";

let midiArray;
let noteTracks;
let piano;

let w; // Canvas width
let h; // Canvas height
const numOfKeys = 88;
const startKey = 21;

let tempoEvents; // microseconds per tick

let frameSkip = 20;
let frameCounter = 0;

function setMidiArray(data) {
  midiArray = data;
}

function preload() {
  midiArray = loadJSON("./assets/lyrith.json", (data) => {
    noteTracks = interpretMidiEvents(data);
    tempoEvents = getTempoEvents(data);
  });
}

function setup() {
  console.log(tempoEvents);
  updateHW();
  createCanvas(w, h);

  piano = new Piano(startKey, startKey + numOfKeys - 1, [85, 0, 85]);
}

function draw() {
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
