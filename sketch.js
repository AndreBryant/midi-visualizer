import { MidiParser } from "./node_modules/midi-parser-js/src/midi-parser.js";
let base64;
let midiArray;
let piano;
let numOfKeys = 128;
let startKey = 0;
let w = window.innerWidth * 0.75;
let h = (9 * w) / 16;
let scheme = [];

function setup() {
  createCanvas(w, h);
  background(25);
  loadColors();
  console.log(w, h);
  piano = new Piano(startKey, startKey + numOfKeys - 1, 75);
  piano.show();
}

function draw() {
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

window.setup = setup;
window.draw = draw;
