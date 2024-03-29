const Phaser = importScripts('phaser.js')
const TextureManager = new Phaser.Textures.TextureManager();

const EXPIRES_AFTER = 30000
const CACHE_INVALIDATION_INTERVAL = 1000
const CACHE_INVALIDATION_EXPECTED_TIME = 100
const TILESET_WIDTH = 525
const TILESET_HEIGTH = 300
const TILE_WIDTH = 25;
const TILE_HEIGHT = 25;
const NUMBER_OF_TILESET_COLUMNS = TILESET_WIDTH / TILESET_HEIGTH

/**
 * 
 */
function LoadedAsset(assetPath, expiresAfter = EXPIRES_AFTER) {
  this.assetPath = assetPath
  this.expiresAfter = expiresAfter
  this.expiresAt = undefined
}

/**
 * 
 */
function ChunkBitmap (asset, chunkX, chunkY, bitmap, expiresAfter = EXPIRES_AFTER) {
  this.asset = asset
  this.chunkX = chunkX
  this.chunkY = chunkY
  this.bitmap = bitmap
  this.expiresAfter = expiresAfter
  this.expiresAt = undefined
}

/**
 * 
 */
function getChunkBitmap (x, y) {
  if (chunkBitmaps[x] === undefined || chunkBitmaps[x][y] === undefined) {
    return false
  } else {
    const chunk = chunkBitmaps[x][y]
    chunk.expiresAt = Date.now() + chunk.expiresAfter
    return chunkBitmaps[x][y]
  }
}

/**
 * 
 */
function setChunkBitmap (chunkBitmap) {
  if (chunkBitmaps[chunkBitmap.chunkX] === undefined) {
    chunkBitmaps[chunkBitmap.chunkX] = {}
  }

  if (chunkBitmaps[chunkBitmap.chunkX][chunkBitmap.chunkY] === undefined) {
    chunkBitmaps[chunkBitmap.chunkX][chunkBitmap.chunkY] = blitter
    chunkIndex.push([chunkBitmap.chunkX, chunkBitmap.chunkY])
  }
}

/**
 * 
 */
function getTextureOffsets(tileValue) {
  const row = Math.floor(tileValue / NUMBER_OF_TILESET_COLUMNS);
  const col = tileValue % NUMBER_OF_TILESET_COLUMNS;

  return {
    x: col,
    y: row
  };
}

/**
 * 
 * @param {*} worker 
 */
function createChunkBitmap (worker, loader, assetPath, tiles, buffer, chunkX, chunkY) {
  const bigBlitter = new Phaser.GameObjects.Blitter(null, 0, 0, '')
  const blitters = [];
  const texture = TextureManager.get(assetPath);

  for (let x = 0; x < tiles.length; x++) {
    for (let y = 0; y < tiles[x].length; y++) {
      const tileValue = tiles[x][y]

      if (tileValue === -1) {
        continue
      }

      const offsets = getTextureOffsets(tileValue)
      const tile = texture.cut(offset.x, offsets.y, TILESET_WIDTH, TILESET_HEIGTH);
      bigBlitter.createFromRenderTexture(tile.image, x * TILE_WIDTH, y * TILE_HEIGHT)
    }
  }

  // populate the transferable object with the blitter pixels
  const pixels = new Uint8Array(bigBlitter.frame.width * bigBlitter.frame.height * 4);
  bigBlitter.frame.extract(pixels, 0, 0);
  bigBlitter.destroy()
  texture.destroy()
  const chunk = new chunkBitmap(assetPath, chunkX, chunkY, pixels)
  setChunkBitmap(chunk)
  return chunk
}

/**
 * 
 */
function sendChunk(port, buffer, chunk) {
   // populate the transferable object with the blitter pixels
  buffer.set(chunk.bitmap);

  // post the transferable object back to the main thread
  port.postMessage(buffer, [buffer.buffer]); 
}

let invalidatingCache = false
const chunkBitmaps = {} // number[][]
const chunkIndex = []
const loadedAssets = []

/**
 * set up an event listener for incoming messages from the main thread
 * @param {*} event 
 */
self.onconnect = function(event) {
  const port = event.ports[0];
  port.onmessage = function(event) {
    const now = Date.now()

    // Delay this message until the cache has finished invalidating
    if (invalidatingCache !== false) {
      await new Promise(resolve => {
        setTimeout(resolve, invalidatingCache - now + 1)
      })
    }

    const { assetPath, tiles, buffer, x, y } = event.data;
    const loadedAsset = loadedAssets.find(asset => asset.assetPath === assetPath)

    const chunk = getChunkBitmap(x, y)

    if (chunk !== undefined) {
      loadedAsset.expiresAt = now + loadedAsset.expiresAfter
      return sendChunk(port, buffer, chunk)
    } else if (loadedAsset === undefined) {
      // Asset is novel, load it
      const loader = new Phaser.Loader.LoaderPlugin(TextureManager);

      loader.load.image(assetPath, assetPath);
      loader.onLoadComplete.addOnce(() => {
        // Stitch together the chunk bitmap
        const chunk = createChunkBitmap(self, loader, assetPath, tiles, buffer)
        loader.destroy()
        sendChunk(port, buffer, chunk)
      })
      loader.start();
    }

    loadedAsset.expiresAt = now + loadedAsset.expiresAfter
  }
}

//  Check caching for invalidation
setInterval(() => {
  const now = Date.now()

  invalidatingCache = now + CACHE_INVALIDATION_EXPECTED_TIME // @TODO I hope 100ms is enough for this!

  for (let i = chunkIndex.length - 1; i >= 0; i--) {
    if (chunks[index[0]] !== undefined) {
      const chunkBitmap = chunks[index[0]][index[1]]

      if (chunkBitmap !== undefined) {
        if (now > chunkBitmap.expiresAt) {
          chunkBitmap.bitmap.parentContainer.remove(chunkBitmap.bitmap)
          chunkBitmap.bitmap.destroy()
          delete chunks[index[0]][index[1]]
          chunkIndex.splice(i, 1)
        }
      }
    }
  }

/*
  for (let i = loadedAssets.length - 1; i >= 0; i--) {
    const asset = loadedAssets[i]
    if (Date.now() > asset.expiresAt) {
      loadedAssets.splice(i, 1)
    }
  }
*/
  invalidatingCache = false
}, CACHE_INVALIDATION_INTERVAL)
