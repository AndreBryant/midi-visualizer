export function toggleCanvas(canvas) {
  if (!isElementHidden(canvas)) {
    canvas.hide();
  } else {
    canvas.show();
  }
}

function isElementHidden(element) {
  const style = window.getComputedStyle(element.elt);
  return style.display === "none" || style.visibility === "hidden";
}
