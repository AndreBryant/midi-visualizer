const ModKeyMappings = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];

export class Piano {
  startKey;
  lastKey;
  numofKeys;
  whiteKeyWidth;
  whiteKeyHeight;
  blackKeyWidth;
  blackKeyHeight;
  keyRimColor;
  noteTracks = [];
  keyboardState = [];
  wk = [];
  bk = [];
  scheme = [];

  constructor(startKey, numOfKeys, keyRimColor = 75, scheme) {
    this.startKey = startKey;
    this.numOfKeys = numOfKeys;
    this.lastKey = this.startKey + this.numOfKeys - 1;
    this.keyRimColor = keyRimColor;
    this.scheme = scheme;
    for (let i = this.startKey; i <= this.lastKey; i++) {
      if (!this.#checkType(i)) {
        this.wk.push({
          i,
        });
      } else {
        this.bk.push({
          i,
        });
      }

      this.keyboardState.push({
        key: i,
        track: null,
        playing: false,
      });
    }
    this.updateDimensions();
  }

  setNoteTracks(noteTracks) {
    this.noteTracks = noteTracks.slice();
  }

  show() {
    this.#drawKeyRim();
    this.#drawKeys(0);
    this.#drawKeys(1);
  }

  // TODO: Change this to private method
  setNote(key, track) {
    const index = key - this.startKey;
    this.keyboardState[index].track = track;
    this.keyboardState[index].playing = true;
  }

  // TODO: Change this to private method
  unsetNote(key, track) {
    const index = key - this.startKey;
    this.keyboardState[index].track = null;
    this.keyboardState[index].playing = false;
  }

  drawKeyboardState() {
    for (let i = 0; i < this.keyboardState.length; i++) {
      if (!this.keyboardState[i].playing) continue;

      const { key, track } = this.keyboardState[i];
      const type = this.#checkType(key);
      let startPos;
      let wType = null;

      if (!type) {
        const index = this.wk.findIndex((k) => k.i === key);
        startPos = index * this.whiteKeyWidth;

        // Check if white key has left, right, or both black keys
        const left = this.#checkType(key - 1);
        const right = this.#checkType(key + 1);

        if (left && right) {
          wType = "inline";
        } else if (left) {
          wType = "left";
        } else if (right) {
          wType = "right";
        }
      } else {
        const wkp = this.wk.filter((k) => k.i <= key).length;
        startPos = wkp * this.blackKeyWidth - this.whiteKeyWidth / 4;
      }

      this.#drawKey({ type, key, wType }, startPos, this.scheme[track]);
    }
  }

  updateKeyboardState(currentTick) {
    this.keyboardState = Array.from(
      { length: this.lastKey - this.startKey + 1 },
      (_, index) => ({
        key: this.startKey + index,
        channel: null,
        playing: false,
      })
    );

    for (let [i, noteTrack] of this.noteTracks.entries()) {
      noteTrack = noteTrack.filter(
        (note) => currentTick < note.startTime + note.duration
      );

      for (const note of noteTrack) {
        if (
          currentTick >= note.startTime &&
          currentTick < note.startTime + note.duration
        ) {
          this.setNote(note.key, i);
        }
      }
    }
  }

  updateDimensions() {
    this.whiteKeyWidth = width / this.wk.length;
    this.blackKeyWidth = this.whiteKeyWidth;
    this.whiteKeyHeight = height / 5;
    this.blackKeyHeight = this.whiteKeyHeight / 1.5;
  }

  getKeyboardHeight() {
    return this.whiteKeyHeight;
  }

  getKeyWidth(type) {
    return type ? this.blackKeyWidth : this.whiteKeyWidth;
  }

  #drawKeys(type) {
    switch (type) {
      case 0:
        for (let i = 0; i < this.wk.length; i++) {
          this.#drawKey(
            { type: 0, key: this.wk[i].key },
            i * this.whiteKeyWidth
          );
        }
        break;
      case 1:
        for (const k of this.bk) {
          const wkp = this.wk.filter((n) => n.i <= k.i).length;
          const startPos = wkp * this.blackKeyWidth - this.whiteKeyWidth / 4;
          this.#drawKey({ type: 1 }, startPos);
        }
        break;

      default:
        break;
    }
  }

  #drawKey({ type, key = null, wType = null }, startPos, channelColor = null) {
    const h = type ? this.blackKeyHeight : this.whiteKeyHeight;
    const w = this.whiteKeyWidth;

    strokeWeight(0.25);
    stroke(type ? 0 : 95);

    if (channelColor) {
      fill(channelColor);
      stroke(127);
      strokeWeight(1.5);
    } else {
      fill(type ? 0 : 255);
    }

    if (!type) {
      // handle keys and lowest keys
      if (key === this.startKey && ["left", "inline"].includes(wType)) {
        if (wType === "inline") wType = "right";
        if (wType === "left") wType = null;
      }

      if (key === this.lastKey && ["right", "inline"].includes(wType)) {
        if (wType === "inline") wType = "left";
        if (wType === "right") wType = null;
      }
      if (wType) {
        const d = this.whiteKeyWidth / 4;
        switch (wType) {
          case "left":
            beginShape();
            vertex(
              startPos,
              height - this.whiteKeyHeight + this.blackKeyHeight
            );
            vertex(
              startPos + d,
              height - this.whiteKeyHeight + this.blackKeyHeight
            );
            vertex(startPos + d, height - this.whiteKeyHeight);
            vertex(startPos + this.whiteKeyWidth, height - this.whiteKeyHeight);
            vertex(startPos + this.whiteKeyWidth, height);
            vertex(startPos, height);
            endShape();
            break;
          case "right":
            beginShape();
            vertex(startPos, height - this.whiteKeyHeight);
            vertex(
              startPos + this.whiteKeyWidth - d,
              height - this.whiteKeyHeight
            );
            vertex(
              startPos + this.whiteKeyWidth - d,
              height - this.whiteKeyHeight + this.blackKeyHeight
            );
            vertex(
              startPos + this.whiteKeyWidth,
              height - this.whiteKeyHeight + this.blackKeyHeight
            );
            vertex(startPos + this.whiteKeyWidth, height);
            vertex(startPos, height);
            endShape();
            break;
          case "inline":
            beginShape();
            vertex(startPos + d, height - this.whiteKeyHeight);
            vertex(
              startPos + this.whiteKeyWidth - d,
              height - this.whiteKeyHeight
            );
            vertex(
              startPos + this.whiteKeyWidth - d,
              height - this.whiteKeyHeight + this.blackKeyHeight
            );
            vertex(
              startPos + this.whiteKeyWidth,
              height - this.whiteKeyHeight + this.blackKeyHeight
            );
            vertex(startPos + this.whiteKeyWidth, height);
            vertex(startPos, height);
            vertex(
              startPos,
              height - this.whiteKeyHeight + this.blackKeyHeight
            );
            vertex(
              startPos + d,
              height - this.whiteKeyHeight + this.blackKeyHeight
            );
            endShape();
            break;

          default:
            break;
        }
      } else {
        rect(startPos, height - this.whiteKeyHeight, w, h);
      }
    } else {
      rect(startPos, height - this.whiteKeyHeight - 2, w * 0.55, h + 2, 1);
    }
  }

  #drawKeyRim() {
    strokeWeight(2);
    stroke(75);
    line(
      0,
      height - this.whiteKeyHeight - 4,
      width,
      height - this.whiteKeyHeight - 4
    );
    strokeWeight(2);
    stroke(this.keyRimColor);
    line(
      0,
      height - this.whiteKeyHeight - 2,
      width,
      height - this.whiteKeyHeight - 2
    );
  }

  #checkType(keyIndex) {
    return ModKeyMappings[keyIndex % 12];
  }
}
