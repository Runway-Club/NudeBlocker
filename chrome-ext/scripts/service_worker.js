import * as tf from '@tensorflow/tfjs';

const options = { // options
    debug: true,
    modelPath: 'models/default-f16/model.json',
    minScore: 0.38,
    maxResults: 50,
    iouThreshold: 0.5,
    outputNodes: ['output1', 'output2', 'output3'],
    blurNude: true,
    blurRadius: 25,
    labels: undefined, // can be base or default
    classes: { // classes labels
        base: [
            'exposed belly',
            'exposed buttocks',
            'exposed breasts',
            'exposed vagina',
            'exposed penis',
            'male breast',
        ],
        default: [
            'exposed anus',
            'exposed armpits',
            'belly',
            'exposed belly',
            'buttocks',
            'exposed buttocks',
            'female face',
            'male face',
            'feet',
            'exposed feet',
            'breast',
            'exposed breast',
            'vagina',
            'exposed vagina',
            'male breast',
            'exposed penis',
        ],
    },
    composite: undefined, // can be base or default
    composites: { // composite definitions of what is a person, sexy, nude
        base: {
            person: [],
            sexy: [],
            nude: [2, 3, 4],
        },
        default: {
            person: [6, 7],
            sexy: [1, 2, 3, 4, 8, 9, 10, 15],
            nude: [0, 5, 11, 12, 13],
        },
    },
};

const models = []; // holds instance of graph model

// read image file and prepare tensor for further processing
function getTensorFromImage(im) {
    console.log(im);
    const a = tf.browser.fromPixels(im, 3)
    console.log(a);
    const expandedT = tf.expandDims(a, 0);
    const imageT = tf.cast(expandedT, 'float32');
    tf.dispose([expandedT, a]);
    return imageT;
}

// parse prediction data
async function processPrediction(boxesTensor, scoresTensor, classesTensor, inputTensor) {
    const boxes = await boxesTensor.array();
    const scores = await scoresTensor.data();
    const classes = await classesTensor.data();
    const nmsT = await tf.image.nonMaxSuppressionAsync(boxes[0], scores, options.maxResults, options.iouThreshold, options.minScore); // sort & filter results
    const nms = await nmsT.data();
    tf.dispose(nmsT);
    const parts = [];
    for (const i in nms) { // create body parts object
        const id = parseInt(i);
        parts.push({
            score: scores[i],
            id: classes[id],
            class: options.labels[classes[id]], // lookup classes
            box: [ // convert box from x0,y0,x1,y1 to x,y,width,heigh
                Math.trunc(boxes[0][id][0]),
                Math.trunc(boxes[0][id][1]),
                Math.trunc((boxes[0][id][3] - boxes[0][id][1])),
                Math.trunc((boxes[0][id][2] - boxes[0][id][0])),
            ],
        });
    }
    const result = {
        input: { file: inputTensor.file, width: inputTensor.shape[2], height: inputTensor.shape[1] },
        person: parts.filter((a) => options.composite.person.includes(a.id)).length > 0,
        sexy: parts.filter((a) => options.composite.sexy.includes(a.id)).length > 0,
        nude: parts.filter((a) => options.composite.nude.includes(a.id)).length > 0,
        parts,
    };
    if (options.debug) console.log('result:', result);
    return result;
}

// load graph model and run inference
async function runDetection(input) {
    const t = {};
    if (!models[options.modelPath]) { // load model if not already loaded
        try {
            models[options.modelPath] = await tf.loadGraphModel(options.modelPath);
            models[options.modelPath].path = options.modelPath;
            if (options.debug) log.state('loaded graph model:', options.modelPath);
            if (models[options.modelPath].version === 'v2.base') {
                options.labels = options.classes.base;
                options.composite = options.composites.base;
            } else {
                options.labels = options.classes.default;
                options.composite = options.composites.default;
            }
        } catch (err) {
            console.log('error loading graph model:', options.modelPath, err.message, err);
            return null;
        }
    }
    t.input = getTensorFromImage(input.data); // get tensor from image
    console.log(t.input);
    [t.boxes, t.scores, t.classes] = await models[options.modelPath].executeAsync(t.input, options.outputNodes); // run prediction
    const res = await processPrediction(t.boxes, t.scores, t.classes, t.input); // parse outputs
    Object.keys(t).forEach((tensor) => tf.dispose(t[tensor])); // free up memory
    return res;
}

async function  loadModel() {
    console.log("Load: "+options.modelPath);
    if (!models[options.modelPath]) { // load model if not already loaded
        try {
            models[options.modelPath] = await tf.loadGraphModel(chrome.runtime.getURL(options.modelPath));
            models[options.modelPath].path = options.modelPath;
            if (options.debug) console.log('loaded graph model:', options.modelPath);
            if (models[options.modelPath].version === 'v2.base') {
                options.labels = options.classes.base;
                options.composite = options.composites.base;
            } else {
                options.labels = options.classes.default;
                options.composite = options.composites.default;
            }
        } catch (err) {
            console.log('error loading graph model:', options.modelPath, err.message, err);
            return null;
        }
    }
}
console.log("Model loading");
loadModel()
const wrapAsyncFunction = (listener) => (request, sender, sendResponse) => {
    // the listener(...) might return a non-promise result (not an async function), so we wrap it with Promise.resolve()
    Promise.resolve(listener(request, sender)).then(sendResponse);
    return true; // return true to indicate you want to send a response asynchronously
};

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.storage.local.set({
            apiSuggestions: ['tabs', 'storage', 'scripting']
        });
    }
});

chrome.runtime.onMessage.addListener( wrapAsyncFunction(async (request, sender) => {
    console.log(request.images);
    let results = [];
    if (request.images !== undefined) {

       for (let i=0;i< request.images.length;i++) {

           try {
               let img = request.images[i];
               img.data = new ImageData(new Uint8ClampedArray(img.data.data), img.data.width, img.data.height);
               console.log("Process: " + img.src);
               let res = await runDetection(img);
               if (res) {
                   results.push({url: img.src, res: res});
               }
           }
           catch (e) {
               console.log(e);
               results.push({url:request.images[i].src,res:{}});
           }
       }
    }
    return results;
}));