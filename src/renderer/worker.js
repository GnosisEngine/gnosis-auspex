const Phaser = require('phaser')

function LoadedAsset (name, loader, expiresAfter = 30000) {
  this.name = name // Asset name
  this.loader = loader // Phaser.Loader
  this.expiresAfter = expiresAfter
  this.expiresAt = undefined
}

const loadedAssets = [] // LoadedAsset[]

/**
 * 
 * @param {*} worker 
 */
function createChunkBitmap (worker, xOffset, yOffset, width, height) {
  // create a grid of bobs
  const bobs = [];

  for (let i = 0; i < width * height; i++) {
    // @TODO use xOffset and yOffset to get blitter data from the game object
    const bob = this.add.image(0, 0, asset);
    bobs.push(bob);
  }
  
  // set the positions of the bobs to create a grid
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      
      const index = i + j * x;
      const bob = bobs[index];
      bob.x = i * width / x;
      bob.y = j* height / y;
    }
  }
  
  // create a blitter from the bobs
  const blitter = this.add.blitter(0, 0, asset);
  for (let i = 0; i < x * y; i++) {
    const bob = bobs[i];
    blitter.create(bob.x, bob.y, bob.texture.key, 0);
  }
  
  // populate the transferable object with the blitter pixels
  const pixels = new Uint8Array(blitter.frame.width * blitter.frame.height * 4);
  blitter.frame.extract(pixels, 0, 0);
  buffer.set(pixels);
  
  // post the transferable object back to the main thread
  worker.port.postMessage(buffer, [buffer.buffer]);
}

/**
 * set up an event listener for incoming messages from the main thread
 * @param {*} event 
 */
worker.port.onmessage = function(event) {
  // retrieve the data from the message
  const { assetPath, buffer, x, y, width, height } = event.data;
  let asset = loadedAssets.find(asset => asset.name === assetPath)
  const args = [worker, x, y, width, height]

  if (asset === undefined) {
    // Load a new asset
    asset = new LoadedAsset(assetPath, new Phaser.Loader())
    loadedAssets.push(asset)
    loadedAssets.loader.image(assetPath, assetPath);
    loadedAssets.loader.start();
    loadedAssets.loader.onLoadComplete.addOnce(() => {
      // Stitch together the chunk bitmap
      createChunkBitmap.apply(loadedAssets.loader, args)
    })
  } else {
    // Stitch together the chunk bitmap
    createChunkBitmap.apply(loadedAssets.loader, args)
  }
}

// keep the worker alive even when no requests are coming in
worker.port.start();

// set up an interval to keep the worker alive
setInterval(() => {
  // do nothing
}, 1000)
