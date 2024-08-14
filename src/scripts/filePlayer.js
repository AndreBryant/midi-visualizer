export function toggleCanvas(canvas) {
  const style = window.getComputedStyle(canvas.elt);
  if (style.display === "none") {
    canvas.elt.style.display = "block";
  } else {
    canvas.elt.style.display = "none";
  }
}

function isElementHidden(element) {
  const style = window.getComputedStyle(element.elt);
  return style.display === "none" || style.visibility === "hidden";
}
