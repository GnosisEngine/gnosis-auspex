//import Rectangle from './rectangle'
import Camera from '../../camera'
import Chunk from './index'
import City from '../../city'
import { GameScene } from '../../scenes'

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
  getSurroundingChunks (chunkX: number, chunkY: number): ChunkIndex[] {
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

          // @TODO begin drawing all the city elements!
          const { tileLayers, objects } = getChunkData(chunkCoords.x, chunkCoords.y)
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


/*
import { FOV_HEIGHT, FOV_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../config';
import { GameScene } from '../scenes';
import { Chunks } from './chunks';
import { CityLayers, CityLayerIndexes, CityLayerNames } from '../city/layers'

export class CityTile {
  name: string;
  scene: GameScene;
  textureUrlsOrPaths: string[];
  jsonPathOrUrl: string;
  lastCameraX: number;
  lastCameraY: number;
  blitterMap: {
    [key: number]: Phaser.GameObjects.Blitter;
  };
  ringWidth: number;
  ringHeight: number;
  tilesPerCityRow: number;
  fovWidth: number;
  fovHeight: number;
  cameraSynced: boolean = false;
  halfTileWidth = TILE_WIDTH / 2;
  halfTileHeight = TILE_WIDTH / 2;
  chunks: Chunks

  rects: {
    topLeft: Phaser.GameObjects.Rectangle;
    topRight: Phaser.GameObjects.Rectangle;
    bottomLeft: Phaser.GameObjects.Rectangle;
    bottomRight: Phaser.GameObjects.Rectangle;
  };

  constructor(
    scene: GameScene,
    name: string,
    textureUrlsOrPaths: string[],
    jsonPathOrUrl: string,
    ringWidth: number = 1920, // @TODO make this adjustable
    ringHeight: number = 1600, // @TODO make this adjustable
    fovWidth: number = FOV_WIDTH,
    fovHeight: number = FOV_HEIGHT
  ) {
    this.scene = scene;
    this.name = name;
    this.textureUrlsOrPaths = textureUrlsOrPaths;
    this.jsonPathOrUrl = jsonPathOrUrl;
    this.blitterMap = {};
    this.ringWidth = ringWidth;
    this.ringHeight = ringHeight;
    this.tilesPerCityRow = Math.ceil(ringWidth / TILE_WIDTH);
    this.fovWidth = fovWidth;
    this.fovHeight = fovHeight;
  }

  async preload() {
    this.scene.loadAtlas(
      this.name,
      this.textureUrlsOrPaths,
      this.jsonPathOrUrl
    );
  }

  create() {
    // Make city layers and add a blitter to each
    for (const index of CityLayerIndexes) {
      const layerName = CityLayers[index];
      const layer = this.scene.addLayer(layerName);
    }

    const fovWidthOffset = this.fovWidth / -2;
    const fovHeightOffset = this.fovHeight / -2;

    const bounds = this.getBounds(fovWidthOffset, fovHeightOffset);

    // Force the first cull
    this.scene.cameras.main.dirty = true;
    this.lastCameraX = -(this.scene.cameras.main.x + this.fovWidth / 2);
    this.lastCameraY = -(this.scene.cameras.main.y + this.fovWidth / 2);

    // @TODO this is now the chunk manager
    //this.chunks = new Chunks(this.name, this.scene, this.fovWidth, this.fovHeight, this.lastCameraX, this.lastCameraY)

    this.showOnlyLayers([CityLayers.building]); // @TODO think about this
  }

  showOnlyLayers(layerIndexes: number[]) {
    for (const index of CityLayerIndexes) {
      if (layerIndexes.indexOf(index) > -1) {
        this.scene.getLayer(CityLayers[index]).visible = true;
      } else {
        this.scene.getLayer(CityLayers[index]).visible = false;
      }
    }
  }

  getTileIndex(x: number, y: number) {
    return ~~(x / TILE_WIDTH) + ~~(y / TILE_HEIGHT) * this.tilesPerCityRow;
  }

  getBounds(x: number, y: number) {
    const cityLeftLimit = -TILE_WIDTH;
    const cityTopLimit = -TILE_HEIGHT;
    const cityRightLimit = this.ringWidth + TILE_WIDTH;
    const cityBottomLimit = this.ringHeight + TILE_HEIGHT;

    const deadZoneLeftX = x - TILE_WIDTH;
    const deadZoneTopY = y - TILE_WIDTH;
    const deadZoneRightX = x + this.fovWidth + TILE_WIDTH;
    const deadZoneBottomY = y + this.fovHeight + TILE_WIDTH;

    return {
      chunkX: ~~(x / this.fovWidth),
      chunkY: ~~(y / this.fovHeight),
      left:
        deadZoneLeftX < cityLeftLimit
          ? cityLeftLimit
          : deadZoneLeftX > cityRightLimit
          ? cityRightLimit
          : deadZoneLeftX,

      right:
        deadZoneRightX < cityLeftLimit
          ? cityLeftLimit
          : deadZoneRightX > cityRightLimit
          ? cityRightLimit
          : deadZoneRightX,

      top:
        deadZoneTopY < cityTopLimit
          ? cityTopLimit
          : deadZoneTopY > cityBottomLimit
          ? cityBottomLimit
          : deadZoneTopY,

      bottom:
        deadZoneBottomY < cityTopLimit
          ? cityTopLimit
          : deadZoneBottomY > cityBottomLimit
          ? cityBottomLimit
          : deadZoneBottomY,
    };
  }

  update() {
    // @TODO should consider tile X and tile Y to be a modulus of tileWidthOffset so chunks can wrap around
    const cameraX = this.scene.cameras.main.worldView.x + this.fovWidth / 2;
    const cameraY = this.scene.cameras.main.worldView.y + this.fovHeight / 2;

    if (this.lastCameraX === cameraX && this.lastCameraY === cameraY) {
      this.cameraSynced = true;
      return;
    }

    // this.chunks.update(cameraX, cameraY)

    const bounds = this.getBounds(cameraX, cameraY);

    if (cameraX > this.lastCameraX) {
      
    } else if (cameraX < this.lastCameraX) {
      
    }

    if (cameraY > this.lastCameraY) {
      // Moving down

    } else if (cameraY < this.lastCameraY) {
      // moving up

    }

    // Adjust Tile Visibility
    for (const index of CityLayerIndexes) {
      if (this.scene.getLayer(CityLayers[index]).visible === false) {
        continue;
      }

    }

    this.lastCameraX = cameraX;
    this.lastCameraY = cameraY;
  }
}
*/