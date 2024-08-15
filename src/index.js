import "../node_modules/p5/lib/p5.js";

// Bundlimg:
// import "../node_modules/ccapture.js-npmfixed/src/CCapture.js";
// import "../node_modules/ccapture.js-npmfixed/src/download.js";
// import "../node_modules/ccapture.js-npmfixed/src/webm-writer-0.2.0.js";

// Development
import "../node_modules/ccapture.js/src/CCapture.js";
import "../node_modules/ccapture.js/src/download.js";
import "../node_modules/ccapture.js/src/webm-writer-0.2.0.js";

import { toggleCanvas } from "../src/scripts/filePlayer.js";
import { loadColors } from "../src/scripts/scheme.js";
import { NoteCanvas } from "../src/classes/note.js";
import { Piano } from "../src/classes/piano.js";
import {
  interpretMidiEvents,
  getTempoEvents,
  checkCurrentTempo,
} from "./midi-parsing/utils.js";
import { saveAsMp4 } from "./scripts/webmHandler.js";
import { toBase64 } from "./scripts/fileHandling.js";

let MidiParser;
import("./library/main.js").then((m) => {
  MidiParser = m.MidiParser;
});

// Canvas Dimensions
let w, h;

// scheme
let scheme;

// MIDI Data
let noteTracks, midiArray, numOfTracks;
let lastTick = 0;

// Piano meta
let piano, pianoHeight, tempoEvents, ppq;
const rimColor = [85, 0, 85];
const numOfKeys = 128;
const startKey = 0;

// Note Canvas
let noteCanvas, noteWidth;

// Animation frames
let tickSkip, probeDiff, probeTick, tickCount;
let delayStart = 0;

// Video rendering
let capturer, recorder, p5Canvas;
let fps = 60;

// File input
let hasMIDIFileLoaded = false;
let fileReader;

// Player
let paused = false;
let togglePlay, canvasToggler, seeker;

function pause() {
  paused = !paused;
}

function seek() {
  const val = seeker.value();
  probeTick = val;
  tickCount = probeTick + probeDiff;

  // TODO: update notecanvas while seeking
  noteCanvas.updateCanvas(tickCount, probeTick, tickSkip, ppq);
  noteCanvas.show();
  // noteCanvas.checkNotes();

  piano.updateKeyboardState(tickCount);
  piano.show();
  piano.drawKeyboardState();
}

function handleFile(e) {
  const file = this.files[0];
  toBase64(file).then((data) => {
    midiArray = MidiParser.parse(data);
    hasMIDIFileLoaded = true;
    lastTick = 0;
    paused = true;
    // p5Canvas = null;
    piano = null;
    noteCanvas = null;
    noteTracks = interpretMidiEvents(midiArray);
    numOfTracks = noteTracks.length;
    tempoEvents = getTempoEvents(midiArray);
    ppq = midiArray.timeDivision;
    scheme = loadColors(numOfTracks);
    onMidiLoaded();
  });
}

function onMidiLoaded() {
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

  probeDiff = -(height + pianoHeight); // if 1 px == 1 tick... IDK, need to fix this in the future.
  console.log(probeDiff, probeDiff + ppq);
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
    seeker.changed(seek);

    piano.setNoteTracks(noteTracks);
    noteCanvas.setNoteTracks(noteTracks);
  }
}

function setup() {
  updateHW();
  frameRate(fps);
  p5Canvas = createCanvas(w, h);
  p5Canvas.parent("sketch-holder");

  fileReader = select("#filereader");
  fileReader.elt.addEventListener("change", handleFile);

  togglePlay = select("#togglePlay");
  togglePlay.elt.addEventListener("click", pause);

  canvasToggler = select("#canvasToggler");
  canvasToggler.elt.addEventListener("click", () => toggleCanvas(p5Canvas));

  seeker = select("#seeker");

  if (!recorder) {
    recorder = document.querySelector("#renderStarter");
    recorder.onclick = record;
  }

  onMidiLoaded();
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
    console.log(tickSkip);
    seeker.value(tickCount);

    background(24);

    noteCanvas.updateCanvas(tickCount, probeTick, tickSkip, ppq);
    noteCanvas.show();
    noteCanvas.checkNotes();

    piano.updateKeyboardState(tickCount);
    piano.show();
    piano.drawKeyboardState();
  }

  if (tickCount >= lastTick) {
    paused = true;
    if (capturer) {
      capturer.stop();
      capturer.save();
      // capturer.save(saveAsMp4);
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
  // w = 1920;
  // h = 1080;
}

// animation
function record() {
  capturer = new CCapture({ format: "webm", framerate: 60, verbose: true });
  capturer.start();

  paused = false;

  recorder.textContent = "cancel recording";
  recorder.onclick = (e) => {
    capturer.stop();
    capturer.save();
    // capturer.save(saveAsMp4);
    capturer = null;
    recorder.textContent = "Start recording";
    recorder.onclick = record;
  };
}

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
