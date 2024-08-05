class Piano {
  startKey;
  lastKey;
  numofKeys;
  whiteKeyWidth;
  whiteKeyHeight;
  blackKeyWidth;
  blackKeyHeight;
  keyRimColor;
  keyboardState; // make use of this haha
  wk = [];
  bk = [];

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
    }
    this.updateDimensions();
  }

  show() {
    this.#drawKeyRim();
    this.#drawKeys(0);
    this.#drawKeys(1);
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
          this.#drawKey(0, i * this.whiteKeyWidth);
        }
        break;
      case 1:
        for (const k of this.bk) {
          const wkp = this.wk.filter((n) => n.i <= k.i).length;
          const startPos = wkp * this.blackKeyWidth - this.whiteKeyWidth / 4;
          this.#drawKey(1, startPos);
        }
        break;

      default:
        break;
    }
  }

  #drawKey(type, startPos, channelColor = null) {
    const h = type ? this.blackKeyHeight : this.whiteKeyHeight;
    const w = this.whiteKeyWidth;

    stroke(type ? 0 : 95);
    if (channelColor) {
      fill(channelColor);
    } else {
      fill(type ? 0 : 255);
    }

    if (!type) {
      rect(startPos, height - this.whiteKeyHeight, w, h);
    } else {
      rect(startPos, height - this.whiteKeyHeight, w * 0.55, h);
    }
  }

  #drawKeyRim() {
    strokeWeight(2);
    stroke(this.keyRimColor);
    line(
      0,
      height - this.whiteKeyHeight - 4,
      width,
      height - this.whiteKeyHeight - 4
    );
  }

  #checkType(keyIndex) {
    return ModKeyMappings[keyIndex % 12];
  }
}

// 0 -> white key
// 1 -> black key
const ModKeyMappings = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
