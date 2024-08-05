function interpretMidiEvents(midiArray) {
  let notes = [];
  for (const track of midiArray.track) {
    let nWallTime = 0;
    let notesBeingProcessed = [];
    let result = [];
    for (const event of track.event) {
      nWallTime += event.deltaTime;
      if (event.type === 9) {
        const note = {
          key: event.data[0],
          velocity: event.data[1],
          channel: event.channel,
          startTime: nWallTime,
          duration: 0,
        };

        notesBeingProcessed.push(note);
      }
      if (event.type === 8) {
        const key = event.data[0];
        const channel = event.channel;

        for (let i = notesBeingProcessed.length - 1; i >= 0; i--) {
          const note = notesBeingProcessed[i];
          if (note.key === key && note.channel === channel) {
            note.duration = nWallTime - note.startTime;
            result.push(note);
            notesBeingProcessed.splice(i, 1);
            break;
          }
        }
      }
    }

    for (const note of notesBeingProcessed) {
      note.duration = nWallTime - note.startTime;
      result.push(note);
    }
    notes.push(result);
  }

  return notes;
}

function _addNotesToCanvas(noteTracks, currentTick) {
  let keyboard = new Array(128).fill("|"); //▮
  console.clear();
  for (const noteTrack of noteTracks) {
    if (noteTrack.length > 0) {
      for (const note of noteTrack) {
        if (
          currentTick >= note.startTime &&
          currentTick < note.startTime + note.duration
        ) {
          keyboard[note.key] = designChar("▮", note.channel);
        }
      }
    }
  }
  console.log("Tick: ", currentTick);
  console.log("\n\n\n\n");
  console.log(keyboard.join(""));
}

function designChar(symbol, channel) {
  return `${scheme[channel - 1]}${symbol}${reset}`;
}

function visualizeMIDI(noteTracks, tempoEvents, ppq) {
  let tick = 0;

  function update() {
    let dTick = checkCurrentTempo(tempoEvents, tick, ppq) * 10;
    _addNotesToCanvas(noteTracks, tick);
    // console.log("dTick: ", dTick);
    tick += dTick;
    setTimeout(update, 1);
  }

  update();
}

function checkCurrentTempo(tempoEvents, tick, ppq) {
  let us;
  for (let i = 0; i < tempoEvents.length; i++) {
    if (tempoEvents[i].startTime <= tick) {
      us = tempoEvents[i].value;
    }
  }
  return _getTicksPerMillisecond(us, ppq);
}

function getTempoEvents(tracks) {
  let tempoEvents = [];
  for (const track of tracks.track) {
    for (const event of track.event) {
      if (event.metaType && event.metaType === 81) {
        tempoEvents.push({
          value: event.data,
          startTime: event.deltaTime,
        });
      }
    }
  }
  return tempoEvents;
}

function _getTicksPerMillisecond(us, ppq) {
  return Math.round(ppq / (us / 1000));
}
