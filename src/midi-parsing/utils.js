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

function checkCurrentTempo(tempoEvents, tick) {
  let us = 0;
  // TODO: fix this
  for (let i = 0; i < tempoEvents.length; i++) {
    const t = tempoEvents[i];
    us = t.startDuration <= tick ? t.value : us;
  }
  return us;
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
