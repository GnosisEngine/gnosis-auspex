import { CityLayerIndexes, CityLayers } from '.'
import { CHUNK_DESTRUCT_DELAY } from '../config'
import { GameScene } from '../scenes'

// At 1925 width and 950 height, we're looking at 2,926 tiles per chunk layer
// At 12 layers, we're looking at 35,112 tiles per chunk
// At 9 chunks, we're looking at 316,008 tiles

interface BlitterMap {
  [key: number]: Phaser.GameObjects.Blitter
}

interface ChunkCache {
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
  debug: {
    [key: string]: Phaser.GameObjects.Rectangle
  } = {}

  /**
   * 
   */
  constructor (assetName: string, scene: GameScene, fovWidth: number, fovHeight: number, cameraX: number, cameraY: number) {
    this.fovWidth = fovWidth
    this.fovHeight = fovHeight
    const { x, y } = this.getChunk(cameraX, cameraY)
    this.lastChunkX = x
    this.lastChunkY = y
    this.assetName = assetName
    this.scene = scene

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
  }

  /**
   * @TODO remove this
   */
  debugRect (name: string, chunk: ChunkIndex) {
    const xy = this.getXY(chunk.x, chunk.y)

    if (this.debug[name] === undefined) {
      this.debug[name] = this.scene.add
      .rectangle(xy.x, xy.y, this.fovWidth, this.fovHeight)
      .setStrokeStyle(1, 0x008800)
    } else {
      this.debug[name].x = xy.x
      this.debug[name].y = xy.y
    }
  }

  /**
   * Get the chunk X/Y from a camera X/Y
   */
  getChunk (cameraX: number, cameraY: number): ChunkIndex {
    return {
      x: Math.floor(cameraX / this.fovWidth) + 1,
      y: Math.floor(cameraY / this.fovHeight) + 1
    }
  }

  /**
   * Returns the x/y coords of a chunk
   */
  getXY (chunkX: number, chunkY: number): ChunkIndex {
    return {
      x: (chunkX) * (this.fovWidth),
      y: (chunkY) * (this.fovHeight)
    }
  }

  /**
   * Returns the chunks surrounding a specific chunk
   */
  getSurroudingChunks (chunkX: number, chunkY: number): { [key: string] : ChunkIndex} {
    return {
      topLeft: {
        x: chunkX - 1,
        y: chunkY - 1
      },
      top: {
        x: chunkX,
        y: chunkY - 1
      },
      topRight: {
        x: chunkX + 1,
        y: chunkY - 1
      },
      left: {
        x: chunkX - 1,
        y: chunkY
      },
      right: {
        x: chunkX + 1,
        y: chunkY
      },
      bottomLeft: {
        x: chunkX - 1,
        y: chunkY + 1
      },
      bottom: {
        x: chunkX,
        y: chunkY + 1
      },
      bottomRight: {
        x: chunkX + 1,
        y: chunkY + 1
      }
    }
  }

  /**
   * 
   */
  update (cameraX: number, cameraY: number) {
    const { x, y } = this.getChunk(cameraX, cameraY)
    const chunks = this.getSurroudingChunks(x, y)

    // @TODO remove this
    this.debugRect('topLeft', chunks.topLeft)
    this.debugRect('top', chunks.top)
    this.debugRect('topRight', chunks.topRight)
    this.debugRect('left', chunks.left)
    this.debugRect('right', chunks.right)
    this.debugRect('bottomLeft', chunks.bottomLeft)
    this.debugRect('bottom', chunks.bottom)
    this.debugRect('bottomRight', chunks.bottomRight)

    document.getElementById('debug').innerHTML = `
      <style>
      table, td, th {
        border: 1px solid;
      }
      </style>
      <div>fovWidth: ${this.fovWidth}</div>
      <div>cameraX: ${cameraX}</div>
      <div>cameraY: ${cameraY}</div>
      <div>chunkX: ${x}</div>
      <div>chunkY: ${y}</div>
      <div>lastChunkX: ${this.lastChunkX}</div>
      <div>lastChunkY: ${this.lastChunkY}</div>
      <table>
        <tr>
          <td>${chunks.topLeft.x}/${chunks.topLeft.y}</td>
          <td>${chunks.top.x}/${chunks.top.y}</td>
          <td>${chunks.topRight.x}/${chunks.topRight.y}</td>
        </tr>
        <tr>
          <td>${chunks.left.x}/${chunks.left.y}</td>
          <td>${x}/${y}</td>
          <td>${chunks.right.x}/${chunks.right.y}</td>
        </tr>
        <tr>
          <td>${chunks.bottomLeft.x}/${chunks.bottomLeft.y}</td>
          <td>${chunks.bottom.x}/${chunks.bottom.y}</td>
          <td>${chunks.bottomRight.x}/${chunks.bottomRight.y}</td>
        </tr>
      </table>
    `;

    // @TODO restore this
    if (this.lastChunkX === x && this.lastChunkY === y) {
      return
    }

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

    this.lastChunkX = x
    this.lastChunkY = y
  }

  /**
   * 
   */
   updateChunks (destructChunks: ChunkIndex[], createChunks: ChunkIndex[]) {
    const now = Date.now()

    // Destroy chunks
    for (const chunk of destructChunks) {
      if (this.destructQueue[chunk.x] === undefined) {
        console.log('Create new Destruct Chunk X (marked as 0) at', chunk.x)
        this.destructQueue[chunk.x] = {}
      }

      const destructQueue = this.destructQueue[chunk.x]

      if (destructQueue[chunk.y] === undefined) {
        // This chunk is not scheduled for destruction, schedule it
        destructQueue[chunk.y] = now + CHUNK_DESTRUCT_DELAY
      } else if (now > destructQueue[chunk.y]) {
        // The current time is greater than te expiration time, expire the chunk
        this.modifyBobs(chunk.x, chunk.y, false)

        if (this.destructQueue[chunk.x]) {
          delete this.destructQueue[chunk.x][chunk.y]
        }
    
        if (this.createdChunks[chunk.x]) {
          delete this.createdChunks[chunk.x][chunk.y]
        }
      }
    }

    // Create chunks
    for (const chunk of createChunks) {
      if (this.createdChunks[chunk.x] === undefined) {
        console.log('Create new Chunk X (marked as 0) at', chunk.x)
        this.createdChunks[chunk.x] = {}
      }

      const createdChunk = this.createdChunks[chunk.x]

      if (createdChunk[chunk.y] === undefined) {
        // Create new Chunk Y (marked as 0)
        console.log('Create new Chunk Y (marked as 0) at', chunk.y)
        createdChunk[chunk.y] = 0
      }

      if (createdChunk[chunk.y] === 0) {
        // New chunk created, populate it's blitters
        console.log('Populate the chunks blitters', chunk.x, chunk.y)
        this.modifyBobs(chunk.x, chunk.y, true)
        // ... then flag it as created (marked as 1)
        createdChunk[chunk.y] = 1
      }

      if (this.destructQueue[chunk.x]) {
        // Delete the chunk from the destruct queue if it exists
        console.log('Delete the chunk from the destruct queue if it exists')
        delete this.destructQueue[chunk.x][chunk.y]
      }
    }

    console.log('destructQueue', this.destructQueue)
    console.log('createdChunks', this.createdChunks)
  }

  /**
   * 
   */
   modifyBobs (chunkX: number, chunkY: number, create: boolean) {
    // @TODO do this
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
