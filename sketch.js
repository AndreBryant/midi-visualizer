import { MidiParser } from "./node_modules/midi-parser-js/src/midi-parser.js";

let base64;
let midiArray;
let piano;
let source;

let w;
let h;
const numOfKeys = 88;
const startKey = 21;

function setMidiArray(data) {
  midiArray = data;
}

function setup() {
  source = document.getElementById("filereader");

  MidiParser.parse(source, function (obj) {
    setMidiArray(obj);
  });

  updateHW();
  createCanvas(w, h);

  piano = new Piano(startKey, startKey + numOfKeys - 1, 75);
}

function draw() {
  background(25);
  piano.show();
  piano.addNote(24, 2);
  piano.addNote(26, 3);
  piano.addNote(28, 4);
  piano.addNotesToCanvas();
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
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
