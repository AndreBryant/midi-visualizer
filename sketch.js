import { MidiParser } from "./node_modules/midi-parser-js/src/midi-parser.js";

// Canvas Dimensions
let w;
let h;

// MIDI Data
let noteTracks;
let midiArray;

// Piano meta
const numOfKeys = 128;
const startKey = 0;
let piano;
let pianoHeight;
let tempoEvents;
let ppq;

// Note Canvas
let noteCanvas;
let noteWidth;
let scheme = [];

// Animation frames
let tickSkip;
let probeTick = 0;
let tickCount = 0;

// Video rendering
let fps = 60;
let p5Canvas;
let startMillis;

function preload() {
  midiArray = loadJSON("./assets/lyrith.json", (data) => {
    noteTracks = interpretMidiEvents(data);
    tempoEvents = getTempoEvents(data);
    ppq = data.timeDivision;
  });
  for (let i = 0; i < 16; i++) {
    const r = Math.round(Math.random() * 255);
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);
    scheme.push(color(r, g, b));
  }
}

function setup() {
  updateHW();
  frameRate(fps);
  p5Canvas = createCanvas(w, h);

  noteTracks.forEach((track, index) => {
    noteTracks[index] = track.filter(
      (n) => n.key >= startKey && n.key < startKey + numOfKeys
    );
  });

  piano = new Piano(
    startKey,
    startKey + numOfKeys - 1,
    [85, 0, 85],
    scheme,
    noteTracks
  );

  pianoHeight = piano.getKeyboardHeight();
  noteWidth = piano.getKeyWidth(0);

  noteCanvas = new NoteCanvas(
    pianoHeight,
    noteWidth,
    numOfKeys,
    startKey,
    scheme,
    noteTracks
  );

  tickCount = -(height + pianoHeight);
}

function draw() {
  const uspb =
    checkCurrentTempo(tempoEvents, tickCount) || tempoEvents[0].value;
  tickSkip = Math.round((1000000 * ppq) / (uspb * fps));

  probeTick += tickSkip;
  tickCount += tickSkip;

  background(24);

  noteCanvas.updateCanvas(tickCount, probeTick, tickSkip);
  noteCanvas.checkNotes();
  noteCanvas.show();

  piano.updateKeyboardState(tickCount);
  piano.show();
  piano.drawKeyboardState();
}

function windowResized() {
  updateHW();
  resizeCanvas(w, h);
  piano.updateDimensions();
  noteCanvas.updateDimensions();
}

function updateHW() {
  w = window.innerWidth * 0.95;
  h = w > 1000 ? window.innerHeight * 0.9 : (9 * w) / 16;
}

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
