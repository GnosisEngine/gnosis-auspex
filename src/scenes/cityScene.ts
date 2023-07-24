import { GameScene } from './index'
import type { CityOptions } from '../city'
import ChunkManager from '../renderer/chunks/manager'
import * as Phaser from 'phaser';
import City from '../city'

export interface TileAtlas {
	json: string
	png: string
}

export class CityScene extends GameScene {
  tileAtlases: TileAtlas = [{
    json: 'assets/tiling.json',
    png: 'assets/tiling.png'
  }]

  cityOptions: CityOptions = {
    city: {
      length: 500,
      height: 100
    },
    buildings: {
      minHeight: 100,
      maxHeight: 120,
      minWidth: 15,
      maxWidth: 20,
      minDistance: 0,
      maxDistance: 6,
      averageRoomPopulation: 4
    },
    subway: {
      height: 6,
      onrampDistance: 160,
    },
    fov: {
      width: this.config.width,
      height: this.config.height,
      x: this.config.startX,
      y: this.config.startY
    }
  }

  chunkManager: ChunkManager

  /**
   * Load all atlases
   */
  private loadAtlases(name: string) {
    for (const tileAtlas of this.tileAtlases) {
      this.load.atlas(
        name,
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
  	super.preload()
    this.loadAtlases()
  }

  /**
   * Create the scene
   */
  async create() {
  	await super.create()
  	this.ready = false
    this.city = new City(this, this.cityOptions)
    this.chunkManager = new ChunkManager(this, this.cityOptions.fov.x, this.cityOptions.fov.y, this.cityOptions.fov.width, this.cityOptions.fov.height, options.tileAtlases)
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
