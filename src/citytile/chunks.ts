import { CityLayerIndexes, CityLayers } from ".";
import { CHUNK_DESTRUCT_DELAY } from "../config"
import { GameScene } from "../scenes";

// At 1925 width and 950 height, we're looking at 2,926 tiles per chunk layer
// At 12 layers, we're looking at 35,112 tiles per chunk
// At 9 chunks, we're looking at 316,008 tiles

type BlitterMap = {
  [key: number]: Phaser.GameObjects.Blitter;
};

type ChunkCache = {
  [key: number]: {
    [key: number]: number
  }
}

interface ChunkIndex {
  x: number
  y: number
}

export class Chunks {
  assetName: string
  scene: GameScene
  blitterMap: BlitterMap = {}
  destructQueue: ChunkCache = {}
  createdChunks: ChunkCache = {}
  lastChunkX: number
  lastChunkY: number
  fovWidth: number
  fovHeight: number

  /**
   * 
   */
  constructor (assetName: string, scene: GameScene, fovWidth: number, fovHeight: number, cameraX: number, cameraY: number) {
    this.assetName = assetName
    this.scene = scene
    const { x, y } = this.getChunk(cameraX, cameraY)
    this.fovWidth = fovWidth
    this.fovHeight = fovHeight
    this.lastChunkX = x
    this.lastChunkY = y

    // Create initial blitter layers
    for (const index of CityLayerIndexes) {
      const layerName = CityLayers[index];
      const layer = this.scene.addLayer(layerName);
      const blitter = this.scene.make.blitter({
        key: this.assetName,
        add: false,
      });
      layer.add(blitter);
      this.blitterMap[index] = blitter;
    }
    console.log(this)

  }

  /**
   * Get the chunk X/Y from a camera X/Y
   */
  getChunk (cameraX: number, cameraY: number): ChunkIndex {
    return {
      x: ~~(cameraX / this.fovWidth),
      y: ~~(cameraY / this.fovHeight)
    }
  }

  /**
   * Returns the x/y coords of a chunk
   */
  getXY (chunkX: number, chunkY: number): ChunkIndex {
    return {
      x: (chunkX  + 1) * (this.fovWidth / 2),
      y: (chunkY  + 1) * (this.fovHeight / 2)
    }
  }

  /**
   * Returns the chunks surrounding a specific chunk
   */
  getSurroudingChunks (chunkX: number, chunkY: number): { [key: string] : ChunkIndex} {
    return {
      top: {
        x: chunkX,
        y: chunkY - 1
      },
      topRight: {
        x: chunkX + 1,
        y: chunkY - 1
      },
      right: {
        x: chunkX + 1,
        y: chunkY
      },
      bottomRight: {
        x: chunkX + 1,
        y: chunkY + 1
      },
      bottom: {
        x: chunkX,
        y: chunkY + 1
      },
      bottomLeft: {
        x: chunkX - 1,
        y: chunkY + 1
      },
      left: {
        x: chunkX - 1,
        y: chunkY
      },
      topLeft: {
        x: chunkX - 1,
        y: chunkY - 1
      }
    }
  }

  /**
   * 
   */
  update (cameraX: number, cameraY: number) {
    const { x, y } = this.getChunk(cameraX, cameraY)
/*
    if (this.lastChunkX === x || this.lastChunkY === y) {
      return
    }
*/
    const chunks = this.getSurroudingChunks(x, y)
    console.log('wee')
    const date = new Date();
    document.getElementById('debug').innerHTML = `
      <pre>chunk: ${JSON.stringify(chunks, null, 2)}</pre>
    `;


    if (x > this.lastChunkX) {
      // Moving right
      this.updateChunks([
        chunks.topLeft,
        chunks.left,
        chunks.bottomLeft
      ], [
        chunks.topRight,
        chunks.right,
        chunks.bottomRight
      ])
    } else if (x < this.lastChunkX) {
      // Moving left
      this.updateChunks([
        chunks.topRight,
        chunks.right,
        chunks.bottomRight
      ], [
        chunks.topLeft,
        chunks.left,
        chunks.bottomLeft
      ])

    }

    if (y > this.lastChunkY) {
      // Moving down
      this.updateChunks([
        chunks.topLeft,
        chunks.top,
        chunks.topRight
      ], [
        chunks.bottomLeft,
        chunks.bottom,
        chunks.bottomRight
      ])

    } else if (y < this.lastChunkY) {
      // Moving up
      this.updateChunks([
        chunks.bottomLeft,
        chunks.bottom,
        chunks.bottomRight
      ], [
        chunks.topLeft,
        chunks.top,
        chunks.topRight
      ])
    }
  }

  /**
   * 
   */
   updateChunks (destructChunks: ChunkIndex[], createChunks: ChunkIndex[]) {
    const now = Date.now()

    // Destroy chunks
    for (const destructChunk of destructChunks) {
      if (destructChunk.x < 0 || destructChunk.y < 0) {
        // Negative chunks can't be created or destroyed
        continue
      }

      const destructQueue = this.destructQueue[destructChunk.x] === undefined
        ? {}
        : this.destructQueue[destructChunk.x]

      const chunkExpirationTime = destructQueue[destructChunk.y]

      if (chunkExpirationTime === undefined) {
        // This chunk is not scheduled for destruction, schedule it
        destructQueue[destructChunk.y] = now + CHUNK_DESTRUCT_DELAY
      } else if (now > chunkExpirationTime) {
        // The current time is greater than te expiration time, expire the chunk
        this.modifyBobs(destructChunk.x, destructChunk.y, false)

        if (this.destructQueue[destructChunk.x]) {
          delete this.destructQueue[destructChunk.x][destructChunk.y]
        }
    
        if (this.createdChunks[destructChunk.x]) {
          delete this.createdChunks[destructChunk.x][destructChunk.y]
        }
      }
    }

    // Create chunks
    for (const createChunk of createChunks) {
      if (createChunk.x < 0 || createChunk.y < 0) {
        // Negative chunks can't be created or destroyed
        continue
      }
      
      let createdChunk = this.createdChunks[createChunk.x]

      if (createdChunk) {
        // Chunk X has already been created
        if (createdChunk[createChunk.y] === undefined) {
          // Create new Chunk Y (marked as 0)
          createdChunk[createChunk.y] = 0
        }
      } else {
        this.createdChunks[createChunk.x] = {}
        createdChunk = this.createdChunks[createChunk.x]
        // Create new chunk (marked as 0)
        createdChunk[createChunk.y] = 0
      }
  
      if (createdChunk[createChunk.y] === 0) {
        // New chunk created, populate it's blitters

        this.modifyBobs(createChunk.x, createChunk.y, true)
  
        // ... then flag it as created (marked as 1)
        createChunk[createChunk.y] = 1
      }
  
      // Delete the chunk from the destruct queue if it exists
      if (this.destructQueue[createChunk.x]) {
        delete this.destructQueue[createChunk.x][createChunk.y]
      }
    }
  }

  /**
   * 
   */
   modifyBobs (chunkX: number, chunkY: number, create: boolean) {
    if (create === true) {
      // create bobs
      const x = 0 // @todo start of chunk
      const y = 0 // @todo end of chunk

      for (const index of CityLayerIndexes) {
        const blitter = this.blitterMap[index]
        /**
         * @todo
         * Creation is going to have to be based off of the results of a seed that generates the needed buidlings, their X/Y, and their layering.
         * The creation then grabs all of that and assembles it on demand.  Without that, we're looking at hundreds of thousands of tiles to represent all layers
         */
        // @TODO Test this with repeating squares on two layers
        // const bob = blitter.create(x, y, 'city1');// @TODO pass name
        // bob.visible = false;    
      }
    } else {
      // delete bobs
      const startIndex = 0 // @todo
      const endIndex = 0 // @todo
  
      for (const index of CityLayerIndexes) {
        const blitter = this.blitterMap[index]
        for (let i = startIndex; i < endIndex; i++) {
          blitter.children.removeAt(i)
        }
      }
    }
  }
}
