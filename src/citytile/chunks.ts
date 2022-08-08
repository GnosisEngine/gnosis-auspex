type DestructQueue = [ number, number, number ] | []

interface ChunkIndex {
  x: number
  y: number
}

export class Chunks {
  destructQueue: DestructQueue = []
  lastChunkX: number
  lastChunkY: number
  fovWidth: number
  fovHeight: number

  /**
   * 
   */
  constructor (fovWidth: number, fovHeight: number, cameraX: number, cameraY: number) {
    const { x, y } = this.getChunk(cameraX, cameraY)
    this.fovWidth = fovWidth
    this.fovHeight = fovHeight
    this.lastChunkX = x
    this.lastChunkY = y
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

    if (this.lastChunkX === x || this.lastChunkY === y) {
      return
    }

    const chunks = this.getSurroudingChunks(x, y)

    if (x > this.lastChunkX) {
      // Moving right
      this.manageBlitters([
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
      this.manageBlitters([
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
      this.manageBlitters([
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
      this.manageBlitters([
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
  manageBlitters (destructChunks: ChunkIndex[], createChunks: ChunkIndex[]) {

  }
}
