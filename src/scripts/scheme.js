export function loadColors(numOfTracks) {
  const colors = [];
  for (let i = 0; i < numOfTracks; i++) {
    const r = Math.round(Math.random() * 255);
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);
    colors.push(color(r, g, b));
  }
  return colors;
}
