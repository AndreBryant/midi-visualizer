import { loadColors } from "./src/scripts/scheme.js";
import { Piano } from "./src/classes/piano.js";
import { NoteCanvas } from "./src/classes/note.js";
import { MidiParser } from "./node_modules/midi-parser-js/src/midi-parser.js";
import {
  interpretMidiEvents,
  getTempoEvents,
  checkCurrentTempo,
} from "./src/midi-parsing/utils.js";

// Canvas Dimensions
let w;
let h;

// scheme
let scheme = [];

// MIDI Data
let noteTracks;
let midiArray = [];
let numOfTracks;
let lastTick = 0;

// Piano meta
const numOfKeys = 128;
const startKey = 0;
const rimColor = [85, 0, 85];
let piano;
let pianoHeight;
let tempoEvents;
let ppq;

// Note Canvas
let noteCanvas;
let noteWidth;

// Animation frames
let delayStart = 0;
let tickSkip;
let probeTick = 0 - delayStart;
let tickCount = 0;

// Video rendering
let fps = 60;
let capturer;
let btn;
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

let canvasToggler = document.querySelector("#canvasToggler");
canvasToggler.addEventListener("click", toggleCanvas);
let seekBar = document.querySelector("#seekBar");

// player
function toggleCanvas() {
  if (!isElementHidden(p5Canvas)) {
    p5Canvas.hide();
  } else {
    p5Canvas.show();
  }
}

// player
function isElementHidden(element) {
  const style = window.getComputedStyle(element.elt);
  return style.display === "none" || style.visibility === "hidden";
}

// animation
function record() {
  capturer = new CCapture({ format: "webm", frameRate: 60 });
  capturer.start();

  paused = false;

  btn.textContent = "cancel recording";
  btn.onclick = (e) => {
    capturer.stop();
    capturer.save();
    capturer = null;
    btn.textContent = "Start Render";
    btn.onclick = record;
  };
}

function setup() {
  updateHW();
  frameRate(fps);
  p5Canvas = createCanvas(w, h);
  p5Canvas.parent("sketch-holder");

  fileReader = select("#filereader");
  fileReader.elt.removeEventListener("change", handleFile);
  fileReader.elt.addEventListener("change", handleFile);

  piano = new Piano(startKey, numOfKeys, rimColor, scheme);

  pianoHeight = piano.getKeyboardHeight();
  noteWidth = piano.getKeyWidth(0);

  noteCanvas = new NoteCanvas(
    pianoHeight,
    noteWidth,
    numOfKeys,
    startKey,
    scheme
  );

  tickCount = -(height + pianoHeight) - 2 - delayStart;
  probeTick = 0 - delayStart;

  if (noteTracks) {
    noteTracks.forEach((track, index) => {
      noteTracks[index] = track.filter(
        (n) => n.key >= startKey && n.key < startKey + numOfKeys
      );
      const startTime =
        noteTracks[index][noteTracks[index].length - 1]?.startTime;
      const endTime =
        startTime +
        noteTracks[index][noteTracks[index].length - 1]?.duration +
        ppq * 4;

      if (endTime > lastTick) lastTick = endTime;
    });

    piano.setNoteTracks(noteTracks);
    noteCanvas.setNoteTracks(noteTracks);
  }
  if (!btn) {
    btn = document.querySelector("#renderStarter");
    btn.onclick = record;
    // btn.click(); //start recording automatically
  }
}

function draw() {
  clear();
  background(24);
  noteCanvas.show();
  piano.show();
  piano.drawKeyboardState();

  if (hasMIDIFileLoaded && !paused) {
    const uspb =
      checkCurrentTempo(tempoEvents, tickCount) || tempoEvents[0].value;
    tickSkip = (1000000 * ppq) / (uspb * fps);

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
    if (capturer) {
      capturer.stop();
      capturer.save();
      capturer = null;
      btn.textContent = "Start Recording";
      btn.onclick = record;
    }
  }

  if (capturer && tickCount <= lastTick) {
    requestAnimationFrame(draw);
    capturer.capture(document.getElementById("defaultCanvas0"));
  }
}

function windowResized() {
  updateHW();
  resizeCanvas(w, h);
  piano.updateDimensions();
  noteCanvas.updateDimensions();
}

function updateHW() {
  w = 1280;
  h = 720;
}

function handleFile(e) {
  const file = this.files[0];
  toBase64(file).then((data) => {
    midiArray = MidiParser.parse(data);
    hasMIDIFileLoaded = true;
    lastTick = 0;
    paused = true;
    p5Canvas = null;
    piano = null;
    noteCanvas = null;
    noteTracks = interpretMidiEvents(midiArray);
    numOfTracks = noteTracks.length;
    tempoEvents = getTempoEvents(midiArray);
    console.log(tempoEvents);
    ppq = midiArray.timeDivision;
    scheme = loadColors(numOfTracks);
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

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
