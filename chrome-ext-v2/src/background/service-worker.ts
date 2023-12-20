import {NsfwSpy} from "@nsfwspy/browser";

async function loadModel() {
    const nsfw = new NsfwSpy(chrome.runtime.getURL("models/mobilenet-v1.0.0/model.json"));
    await nsfw.load();
    console.log("Model loaded");
    console.log(nsfw);
    return nsfw;
}

console.log("Service worker starting...");
loadModel();