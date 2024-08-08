import { MidiParser } from "./node_modules/midi-parser-js/src/midi-parser.js";

// Canvas Dimensions
let w;
let h;

// MIDI Data
let noteTracks;
let midiArray = [];
let lastTick = 0;

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
let delayStart = 0;
let tickSkip;
let probeTick = 0 - delayStart;
let tickCount = 0;

// Video rendering
let fps = 60;
let p5Canvas;

// File input
let fileReader;
let hasMIDIFileLoaded = false;

// Player
let render;
let paused = false;
let togglePlay = document.querySelector("#togglePlay");
togglePlay.addEventListener("click", () => {
  paused = !paused;
});

function preload() {
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

  fileReader = select("#filereader");
  fileReader.changed(handleFile);

  piano = new Piano(startKey, startKey + numOfKeys - 1, [85, 0, 85], scheme);

  pianoHeight = piano.getKeyboardHeight();
  noteWidth = piano.getKeyWidth(0);

  noteCanvas = new NoteCanvas(
    pianoHeight,
    noteWidth,
    numOfKeys,
    startKey,
    scheme
  );

  tickCount = -(height + pianoHeight) - delayStart;
  probeTick = 0 - delayStart;

  if (noteTracks) {
    noteTracks.forEach((track, index) => {
      noteTracks[index] = track.filter(
        (n) => n.key >= startKey && n.key < startKey + numOfKeys
      );
      const startTime =
        noteTracks[index][noteTracks[index].length - 1]?.startTime;
      const endTime =
        startTime + noteTracks[index][noteTracks[index].length - 1]?.duration;

      if (endTime > lastTick) lastTick = endTime;
    });

    piano.setNoteTracks(noteTracks);
    noteCanvas.setNoteTracks(noteTracks);
  }
}

function draw() {
  background(24);
  piano.show();
  noteCanvas.show();
  if (hasMIDIFileLoaded && !paused) {
    // console.log(paused);
    const uspb =
      checkCurrentTempo(tempoEvents, tickCount) || tempoEvents[0].value;
    tickSkip = Math.round((1000000 * ppq) / (uspb * fps));

    probeTick += tickSkip;
    tickCount += tickSkip;

    background(24);

    noteCanvas.updateCanvas(tickCount, probeTick, tickSkip);
    noteCanvas.show();
    noteCanvas.checkNotes();

    piano.updateKeyboardState(tickCount);
    piano.show();
    piano.drawKeyboardState();
  }

  if (tickCount >= lastTick) {
    hasMIDIFileLoaded = false;
    lastTick = 0;
  }
}

function windowResized() {
  updateHW();
  resizeCanvas(w, h);
  piano.updateDimensions();
  noteCanvas.updateDimensions();
}

function updateHW() {
  w = window.innerWidth * 0.95;
  // h = window.innerHeight * 0.9;
  h = w > 1000 ? window.innerHeight * 0.9 : (9 * w) / 16;
}

function handleFile(e) {
  const file = this.elt.files[0];
  toBase64(file).then((data) => {
    midiArray = MidiParser.parse(data);
    hasMIDIFileLoaded = true;
    lastTick = 0;
    paused = false;
    noteTracks = interpretMidiEvents(midiArray);
    tempoEvents = getTempoEvents(midiArray);
    ppq = midiArray.timeDivision;
    preload();
    setup();
  });
}

async function toBase64(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = function () {
      resolve(reader.result);
    };

    reader.onerror = function (error) {
      reject(error);
    };
  });
}

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
