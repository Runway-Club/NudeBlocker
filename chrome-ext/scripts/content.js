
// query all images
var images = document.querySelectorAll('img');
let imageUrls = [];
// loop through all images
for (var i = 0; i < images.length; i++) {
    // get the image
    var img = images[i];
    // get the image source
    var src = img.src;
    imageUrls.push(src);
    // replace the image source with the cat image
    img.src = 'https://placekitten.com/' + img.width + '/' + img.height;
    // log the image source
    console.log(src);

}

(async () => {
    console.log(images);
    let imageRawData = [];
    for (let i=0;i<images.length;i++) {
        let img = images[i];
        const canvas = new OffscreenCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        console.log(imageData);
        // object to array
        const data = Array.from(imageData.data);
        imageRawData.push({src:img.src,data:{data:data,width:img.width,height:img.height}});

    }
    console.log(imageRawData);
    chrome.runtime.sendMessage({ images : imageRawData}, (response) => {
        console.log(response);
    });

})();
