import Rectangle from './rectangle'
import Camera from '../camera'
import Chunk from './chunkManager'
import City from './index'
import { GameScene } from '../scenes'

interface ChunkIndex {
  x: number
  y: number
}

interface ChunkInstance {
  [key: string]: Chunk
}

export interface ChunkRange {
  target: Element
  x: number
  y: number
  width: number
  height: number
}

let newChunkId = 1

export default class ChunkManager {
  scene: GameScene
  fovWidth: number
  fovHeight: number
  lastChunkX: number
  lastChunkY: number
  chunks: ChunkInstance = {}

  /**
   * Called in: ./index.ts (constructor)
   */
  constructor (scene: GameScene, startX: number, startY: number, fovWidth: number, fovHeight: number) {
    this.fovWidth = fovWidth
    this.fovHeight = fovHeight
    this.scene = scene

    const { x, y } = this.getChunkIndex(startX, startY)

    this.lastChunkX = x
    this.lastChunkY = y
    // this.assetName = assetName
  }

  /**
   * Get's the index of a chunk based on a camera's position
   */
  getChunkIndex (cameraX: number, cameraY: number): ChunkIndex {
    return {
      x: Math.floor(cameraX / this.fovWidth) + 1,
      y: Math.floor(cameraY / this.fovHeight) + 1
    }
  }

  /**
   * Returns the x/y coords of a chunk
   */
  getChunkCoords (chunkX: number, chunkY: number): ChunkIndex {
    return {
      x: (chunkX) * (this.fovWidth),
      y: (chunkY) * (this.fovHeight)
    }
  }

  /**
   * 
   */
  getSurroudingChunks (chunkX: number, chunkY: number): ChunkIndex[] {
    const topLeft = {
      x: chunkX - 1,
      y: chunkY - 1
    }
    
    const top = {
      x: chunkX,
      y: chunkY - 1
    }
    
    const topRight = {
      x: chunkX + 1,
      y: chunkY - 1
    }
    
    const left = {
      x: chunkX - 1,
      y: chunkY
    }
    
    const right = {
      x: chunkX + 1,
      y: chunkY
    }
    
    const bottomLeft = {
      x: chunkX - 1,
      y: chunkY + 1
    }
    
    const bottom = {
      x: chunkX,
      y: chunkY + 1
    }
    
    const bottomRight = {
      x: chunkX + 1,
      y: chunkY + 1
    }

    return [
      top,
      topRight,
      right,
      bottomRight,
      bottom,
      bottomLeft,
      left,
      topLeft
    ]
  }

  /**
   * Updates whats chunks are availbile for display
   * This is the beating heart of how the graphics engine deals with tile rendering!
   * Called by: 
   */
  update (camera: Camera, city: City) {
    const { x, y } = this.getChunkIndex(camera.x, camera.y)

    if (x !== this.lastChunkX || y !== this.lastChunkY) {
      const chunkIndexs = this.getSurroundingChunks(x, y)

      // Create new chunks
      for (const chunkIndex in chunkIndexs) {
        const key = `${chunkIndex.x}-${chunkIndex.y}`
        const chunk = this.chunks[key] || new Chunk(this.scene, chunkIndex.x, chunkIndex.y, newChunkId)
        newChunkId += 1

        if (chunk.loaded === false) {
          // Schedule chunk for creation
          const chunkCoords = this.getChunkCoords(x, y)
          /*
           @TODO
          const { tileLayers, objects } = city.getChunk(new Rectangle(
            chunkCoords.x,
            chunkCoords.y,
            camera.width,
            camera.height
          ))
          */

          const { tileLayers, objects } = getChunkData(chunkCoords.x, chunkCoords.y) // @TODO
          chunk.load(400, 200, tileLayers, objects) //@TODO coords
          this.chucks[key] === chunk
        } else {
          // Schedule chunks for destruction
          const purge = []

          if (chunkKey.x < x - 1) {
            purge.push(chunk)
          } else if (chunkKey.x > x + 1) {
            purge.push(chunk)
          } else if (chunkKey.y < y - 1) {
            purge.push(chunk)
          } else if (chunkKey.y > y + 1) {
            purge.push(chunk)
          }

          for (const purgeChunk of purge) {
            purgeChunk.destroy()
          }
        }
      }

      this.lastChunkX = x
      this.lastChunkY = y
    }
  }
}
