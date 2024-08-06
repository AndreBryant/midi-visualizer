import { MidiParser } from "./node_modules/midi-parser-js/src/midi-parser.js";

let base64;
let midiArray;
let piano;

let w;
let h;
const numOfKeys = 88;
const startKey = 21;
const scheme = [];

function setup() {
  w = window.innerWidth * 0.95;
  h = w > 1000 ? w / 2 : (9 * w) / 16;
  createCanvas(w, h);
  loadColors();

  piano = new Piano(startKey, startKey + numOfKeys - 1, 75);
}

function draw() {
  background(25);
  piano.show();
  // console.log(midiArray);
}

function loadColors() {
  for (let i = 0; i < 16; i++) {
    const r = Math.round(Math.random() * 255);
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);
    scheme.push(color(r, g, b));
  }
}

function windowResized() {
  console.log("Window resized"); // Add this line to check if the function is called
  w = window.innerWidth * 0.95;
  h = w > 1000 ? w / 2 : (9 * w) / 16;
  resizeCanvas(w, h);
  piano.updateDimensions();
}

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
