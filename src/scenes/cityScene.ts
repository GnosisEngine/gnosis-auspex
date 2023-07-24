import type { CityOptions } from '../city'
import { NewGameScene } from './newIndex'
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from '../config';
import ChunkManager from '../renderer/chunks/manager'
import * as Phaser from 'phaser';
import City from '../city'

export interface TileAtlas {
  name: string
	json: string
	png: string
}

export class CityScene extends NewGameScene {
  tileAtlases: TileAtlas
  cityOptions: CityOptions
  chunkManager: ChunkManager

  constructor(key: string, tileAtlases: TileAtlas[], cityOptions: CityOptions) {
    super({
      key,
      bounds: {
        x: VIEWPORT_WIDTH / -2,
        y: VIEWPORT_WIDTH / -2,
        width: Infinity,
        height: Infinity,
      }
    });

    this.tileAtlases = tileAtlases
    this.cityOptions = cityOptions
  }

  /**
   * Load all atlases
   */
  private loadAtlases() {
    for (const tileAtlas of this.tileAtlases) {
      this.load.atlas(
        tileAtlas.name,
        tileAtlas.png,
        tileAtlas.json
      );
      // @TODO: Progress bar
    }
  }

  /**
   * 
   */
  preload() {
    this.loadAtlases()
  }

  /**
   * Create the scene
   */
  async create() {
  	await super.create()
  	this.ready = false
    this.city = new City(this, this.cityOptions)
    this.chunkManager = new ChunkManager(this, this.cityOptions.fov.x, this.cityOptions.fov.y, this.cityOptions.fov.width, this.cityOptions.fov.height)
    this.city.generate()
    // @TODO: get FoV chunks from Chunk manager
    this.ready = true
  }

  /**
   *
   */
  update() {
    if (this.ready === false) {
      return;
    }

    this.chunkManager.update(this.camera, this.city)
  }
}
