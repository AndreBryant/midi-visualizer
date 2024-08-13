import { FFmpeg } from "../../node_modules/@ffmpeg/ffmpeg/dist/esm/index.js";
import {
  fetchFile,
  toBlobURL,
} from "../../node_modules/@ffmpeg/util/dist/esm/index.js";

window.FFmpeg = FFmpeg;
window.fetchFile = fetchFile;

export async function saveAsMp4(blob) {
  const src = await webmToMp4SRC(blob);
  const dl = document.createElement("a");
  dl.href = src;
  dl.download = "output.mp4";
  dl.click();
  URL.revokeObjectURL(src);
}

async function webmToMp4SRC(blob) {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: await toBlobURL(
      "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js",
      "text/javascript"
    ),
    wasmURL: await toBlobURL(
      "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm",
      "application/wasm"
    ),
  });
  await ffmpeg.writeFile("input.webm", await blobToUint8Array(blob));
  await ffmpeg.exec(["-i", "input.webm", "output.mp4"]);
  const data = await ffmpeg.readFile("output.mp4");
  return URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
}

async function blobToUint8Array(blob) {
  const arrayBuffer = await new Response(blob).arrayBuffer();
  var uint8View = new Uint8Array(arrayBuffer);
  return uint8View;
}
