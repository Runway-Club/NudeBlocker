
// query all images
var images = document.querySelectorAll('img');

const api = "https://nsfw-filter.app.runwayclub.dev/?url=";

(async () => {
    console.log(images);
    let originalUrls = [];
    for (let i=0;i<images.length;i++) {
        originalUrls.push(images[i].src);
    }
    for (let i=0;i<images.length;i++) {
        try {
            let img = images[i];
            img.crossOrigin = "Anonymous"
            if (img.width === 0 || img.height === 0) {
                continue;
            }
            const canvas = new OffscreenCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            console.log(imageData);
            // object to array
            const data = Array.from(imageData.data);
            img.src = "https://cdn.pixabay.com/animation/2023/03/20/02/45/02-45-27-186_512.gif";
            let bodyJson = {};
            let cachedItem = window.localStorage.getItem(originalUrls[i]);
            if (cachedItem == null) {
                const res = await fetch(api + encodeURIComponent(img.src), {
                    method: 'GET'
                });
                bodyJson = await res.json();
                console.log(bodyJson);
                window.localStorage.setItem(originalUrls[i], bodyJson["score"]);
            } else {
                bodyJson["score"] = cachedItem;
            }
            if (bodyJson["score"] > 0.1) {
                img.src = "https://img.freepik.com/premium-vector/blurred-mosaic-censor-blur-effect-texture_540598-66.jpg";
            } else {
                img.src = originalUrls[i];
            }
        }
        catch(e){
            images[i].src = originalUrls[i];
        }
        // temporary replace image src
    }


})();
