import { MidiParser } from "./node_modules/midi-parser-js/src/midi-parser.js";
import { toggleCanvas } from "./src/scripts/filePlayer.js";
import { loadColors } from "./src/scripts/scheme.js";
import { NoteCanvas } from "./src/classes/note.js";
import { Piano } from "./src/classes/piano.js";
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
let probeDiff;
let probeTick = 0 - delayStart;
let tickCount = 0;

// Video rendering
let fps = 60;
let capturer;
let recorder;
let p5Canvas;

// File input
let fileReader;
let hasMIDIFileLoaded = false;

// Player
let paused = false;

let togglePlay;

let canvasToggler;

let seeker;

function pause() {
  paused = !paused;
}

function setup() {
  updateHW();
  frameRate(fps);
  p5Canvas = createCanvas(w, h);
  p5Canvas.parent("sketch-holder");

  fileReader = select("#filereader");
  fileReader.elt.removeEventListener("change", handleFile);
  fileReader.elt.addEventListener("change", handleFile);

  togglePlay = select("#togglePlay");
  togglePlay.elt.removeEventListener("click", pause);
  togglePlay.elt.addEventListener("click", pause);

  canvasToggler = select("#canvasToggler");
  canvasToggler.elt.removeEventListener("click", () => toggleCanvas(p5Canvas));
  canvasToggler.elt.addEventListener("click", () => toggleCanvas(p5Canvas));

  seeker = select("#seeker");

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

  probeDiff = -(height + pianoHeight) - 2;
  tickCount = probeDiff - delayStart;
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

    seeker.attribute("max", lastTick);
    seeker.attribute("min", 0);
    seeker.changed(() => {
      const val = seeker.value();
      probeTick = val;
      tickCount = probeTick + probeDiff;
    });

    piano.setNoteTracks(noteTracks);
    noteCanvas.setNoteTracks(noteTracks);
  }
  if (!recorder) {
    recorder = document.querySelector("#renderStarter");
    recorder.onclick = record;
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
      recorder.textContent = "Start Recording";
      recorder.onclick = record;
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

// animation
function record() {
  capturer = new CCapture({ format: "webm", frameRate: 60 });
  capturer.start();

  paused = false;

  recorder.textContent = "cancel recording";
  recorder.onclick = (e) => {
    capturer.stop();
    capturer.save();
    capturer = null;
    recorder.textContent = "Start recording";
    recorder.onclick = record;
  };
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
