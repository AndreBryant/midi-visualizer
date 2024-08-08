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
  scheme = [];
  wk = [];
  bk = [];

  constructor(boundary, noteWidth, numOfKeys, startKey, scheme) {
    this.boundary = boundary;
    this.noteWidth = noteWidth;
    this.numOfKeys = numOfKeys;
    this.startKey = startKey;
    this.scheme = scheme;
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

  updateCanvas(noteTracks, currentTick, probeTick, tickSkip) {
    for (const noteTrack of noteTracks) {
      if (noteTrack.length > 0) {
        for (const note of noteTrack) {
          if (
            probeTick >= note.startTime &&
            probeTick < note.startTime + tickSkip
            // note.key >= this.startKey &&
            // note.key <= this.startKey + this.numOfKeys - 1
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
            const noteToAdd = new Note(
              x,
              y,
              w,
              h,
              this.scheme[note.channel],
              dy
            );
            this.addNote(noteToAdd);
            // console.log(noteToAdd);
          }
        }
      }
    }
  }
  #checkType(keyIndex) {
    return ModKeyMappings[keyIndex % 12];
  }
}
