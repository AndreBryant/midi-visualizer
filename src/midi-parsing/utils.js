export function interpretMidiEvents(midiArray) {
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

export function checkCurrentTempo(tempoEvents, tick) {
  let us = 0;
  let i = 0;

  while (i < tempoEvents.length && tick > tempoEvents[i].startTime) {
    us = tempoEvents[i].value;
    i++;
  }
  return us;
}

export function getTempoEvents(tracks) {
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
