
// query all images
var images = document.querySelectorAll('img');



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
            const canvas = new OffscreenCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            console.log(imageData);
            // object to array
            const data = Array.from(imageData.data);
            img.src = "https://cdn.pixabay.com/animation/2023/03/20/02/45/02-45-27-186_512.gif";
            await chrome.runtime.sendMessage({
                images: [{
                    src: originalUrls[i],
                    data: {data: data, width: img.width, height: img.height}
                }]
            }, (response) => {
                console.log(response);
                if (response[0] !== undefined) {
                    if (response[0].res.nude) {
                        images[i].src = "https://i.imgur.com/2ZQZV2w.png"
                    }
                }
                images[i].src = originalUrls[i];

            });
        }
        catch(e){
            images[i].src = originalUrls[i];
        }
        // temporary replace image src
    }


})();
