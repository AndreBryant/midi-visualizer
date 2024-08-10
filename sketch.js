import { MidiParser } from "./node_modules/midi-parser-js/src/midi-parser.js";

// Canvas Dimensions
let w;
let h;

// MIDI Data
let noteTracks;
let midiArray = [];
let numOfTracks;
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

function record() {
  capturer = new CCapture({ format: "webm", frameRate: 60 });
  capturer.start();

  paused = false;

  btn.textContent = "cancel recording";
  btn.onclick = (e) => {
    capturer.stop();
    capturer.save();
    capturer = null;
    btn.textContent = "Start Recording";
    btn.onclick = record;
  };
}

function loadColors() {
  scheme = [];
  for (let i = 0; i < numOfTracks; i++) {
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
  fileReader.elt.removeEventListener("change", handleFile);
  fileReader.elt.addEventListener("change", handleFile);

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
    btn = document.createElement("button");
    btn.textContent = "start recording";
    document.body.appendChild(btn);
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
    console.log(tickSkip, uspb, lastTick);

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
  // w = window.innerWidth * 0.95;
  // h = window.innerHeight * 0.9;
  // h = w > 1000 ? window.innerHeight * 0.9 : (9 * w) / 20;
  // w = 1920;
  // h = (9 * w) / 16;
  w = 1080;
  h = 720;
  // h = 720;
}

function handleFile(e) {
  const file = this.files[0];
  toBase64(file).then((data) => {
    midiArray = MidiParser.parse(data);
    hasMIDIFileLoaded = true;
    lastTick = 0;
    paused = true;
    piano = null;
    noteCanvas = null;
    noteTracks = interpretMidiEvents(midiArray);
    numOfTracks = noteTracks.length;
    tempoEvents = getTempoEvents(midiArray);
    console.log(tempoEvents);
    ppq = midiArray.timeDivision;
    loadColors();
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

function checkCurrentTempo(tempoEvents, tick) {
  let us = 0;
  let i = 0;

  while (i < tempoEvents.length && tick > tempoEvents[i].startTime) {
    us = tempoEvents[i].value;
    i++;
  }
  return us;
}

function getTempoEvents(tracks) {
  let tempoEvents = [];
  let tWallTime = 0;
  for (const track of tracks.track) {
    for (const event of track.event) {
      tWallTime += event.deltaTime;
      if (event.metaType && event.metaType === 81) {
        tempoEvents.push({
          value: event.data,
          startTime: tWallTime,
        });
      }
    }
  }
  return tempoEvents;
}

window.preload = loadColors;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
