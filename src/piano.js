class Piano {
  startKey;
  lastKey;
  numofKeys;
  whiteKeyWidth;
  whiteKeyHeight;
  blackKeyWidth;
  blackKeyHeight;
  keyRimColor;
  keyboardState = []; // make use of this haha
  wk = [];
  bk = [];
  colorScheme = [];

  constructor(startKey, lastKey, keyRimColor = 75) {
    this.startKey = startKey;
    this.lastKey = lastKey;
    this.numofKeys = this.lastKey - this.startKey + 1;
    this.keyRimColor = keyRimColor;
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
        channel: null,
        playing: false,
      });
    }
    this.updateDimensions();
    this.#loadColors();
  }

  show() {
    this.#drawKeyRim();
    this.#drawKeys(0);
    this.#drawKeys(1);
  }

  setNote(key, channel) {
    const index = key - this.startKey;
    this.keyboardState[index].channel = channel;
    this.keyboardState[index].playing = true;
  }

  unsetNote(key, channel) {
    const index = key - this.startKey;
    this.keyboardState[index].channel = null;
    this.keyboardState[index].playing = false;
  }

  drawKeyboardState() {
    for (let i = 0; i < this.keyboardState.length; i++) {
      if (!this.keyboardState[i].playing) continue;

      const { key, channel } = this.keyboardState[i];
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

      this.#drawKey({ type, wType }, startPos, this.colorScheme[channel]);
    }
  }

  updateKeyboardState(noteTracks, currentTick) {
    this.keyboardState = Array.from(
      { length: this.lastKey - this.startKey + 1 },
      (_, index) => ({
        key: this.startKey + index,
        channel: null,
        playing: false,
      })
    );

    for (const [i, noteTrack] of noteTracks.entries()) {
      if (noteTrack.length > 0) {
        for (const note of noteTrack) {
          if (
            currentTick >= note.startTime &&
            currentTick < note.startTime + note.duration
          ) {
            this.setNote(note.key, note.channel);
          }
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

  #drawKeys(type) {
    switch (type) {
      case 0:
        for (let i = 0; i < this.wk.length; i++) {
          this.#drawKey({ type: 0 }, i * this.whiteKeyWidth);
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

  #drawKey({ type, wType = null }, startPos, channelColor = null) {
    const h = type ? this.blackKeyHeight : this.whiteKeyHeight;
    const w = this.whiteKeyWidth;

    strokeWeight(0.25);
    stroke(type ? 0 : 95);

    if (channelColor) {
      fill(channelColor);
    } else {
      fill(type ? 0 : 255);
    }

    if (!type) {
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
      rect(startPos, height - this.whiteKeyHeight - 2, w * 0.55, h + 2);
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

  #loadColors() {
    for (let i = 0; i < 16; i++) {
      const r = Math.round(Math.random() * 255);
      const g = Math.round(Math.random() * 255);
      const b = Math.round(Math.random() * 255);
      this.colorScheme.push(color(r, g, b));
    }
  }

  #checkType(keyIndex) {
    return ModKeyMappings[keyIndex % 12];
  }
}

// 0 -> white key
// 1 -> black key
const ModKeyMappings = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
