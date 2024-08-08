class Note {
  x;
  y;
  dx = 0;
  dy;
  width;
  height;
  color;

  constructor(x, y, width, height, color, dy) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.dy = dy;
  }

  show() {
    stroke(255);
    fill(this.color);
    rect(this.x, this.y, this.width, this.height, 2);
  }

  updateNote() {
    this.x += this.dx;
    this.y += this.dy;
  }
}

class NoteCanvas {
  notes = [];
  noteWidth;
  boundary;
  numOfKeys;
  startKey;
  noteTracks = [];
  scheme = [];
  wk = [];
  bk = [];

  constructor(boundary, noteWidth, numOfKeys, startKey, scheme, noteTracks) {
    this.boundary = boundary;
    this.noteWidth = noteWidth;
    this.numOfKeys = numOfKeys;
    this.startKey = startKey;
    this.scheme = scheme;
    this.noteTracks = noteTracks.slice();
    for (let i = this.startKey; i < this.startKey + this.numOfKeys; i++) {
      if (!this.#checkType(i)) {
        this.wk.push({
          i,
        });
      } else {
        this.bk.push({
          i,
        });
      }
    }
  }

  show() {
    for (const note of this.notes) {
      note.show();
    }
  }

  addNote(note) {
    this.notes.push(note);
  }

  checkNotes() {
    for (let i = this.notes.length - 1; i >= 0; i--) {
      this.notes[i].updateNote();
      if (this.notes[i].y === this.boundary) {
        this.notes.splice(i, 1);
      }
    }
  }

  updateCanvas(currentTick, probeTick, tickSkip) {
    for (let [i, noteTrack] of this.noteTracks.entries()) {
      noteTrack = noteTrack.filter(
        (note) => currentTick < note.startTime + note.duration
      );

      this.noteTracks[i] = noteTrack;

      for (const note of noteTrack) {
        if (
          probeTick >= note.startTime &&
          probeTick < note.startTime + tickSkip
        ) {
          let x;
          let w = this.noteWidth;

          if (!this.#checkType(note.key)) {
            const index = this.wk.findIndex((k) => k.i === note.key);
            x = index * this.noteWidth;
          } else {
            const wkp = this.wk.filter((k) => k.i <= note.key).length;
            x = wkp * this.noteWidth - this.noteWidth / 4;
            w -= this.noteWidth / 2;
          }

          const y =
            -note.duration -
            this.boundary -
            (tickSkip - (probeTick - note.startTime)) -
            20;
          const h = note.duration;
          const dy = tickSkip;
          const noteToAdd = new Note(x, y, w, h, this.scheme[note.channel], dy);
          this.addNote(noteToAdd);
          // console.log(noteToAdd);
        }
      }
    }
  }

  updateDimensions() {
    this.noteWidth = width / this.wk.length;
  }

  #checkType(keyIndex) {
    return ModKeyMappings[keyIndex % 12];
  }
}
