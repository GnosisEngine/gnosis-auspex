import { Game } from 'phaser';
import {
  TILE_HEIGHT,
  TILE_WIDTH,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
} from '../config';
import { GameScene } from '../scenes';

export enum CityLayers {
  sky,
  cityscape,
  rooms,
  building,
  tunnel,
  tunnelAtmosphere,
  street,
  people,
  glowBackground,
  glowForeground,
  weather,
  ground,
}

export const CityLayerIndexes = Object.keys(CityLayers)
  .filter((key) => isNaN(Number(key)) === false)
  .map((key) => Number(key));

export const CityLayerNames = Object.keys(CityLayers).filter(
  (key) => isNaN(Number(key)) === true
);

export class CityTile {
  name: string;
  scene: GameScene;
  textureUrlsOrPaths: string[];
  jsonPathOrUrl: string;
  onCreate: (scene: GameScene, cityTile: CityTile) => CityTile;
  blitterMap: {
    [key: number]: Phaser.GameObjects.Blitter;
  };

  constructor(
    scene: GameScene,
    name: string,
    textureUrlsOrPaths: string[],
    jsonPathOrUrl: string
    // onCreate: () => CityTile
  ) {
    this.scene = scene;
    this.name = name;
    this.textureUrlsOrPaths = textureUrlsOrPaths;
    this.jsonPathOrUrl = jsonPathOrUrl;
    // this.onCreate = onCreate;
    this.blitterMap = {};
  }

  /**
   *
   */
  preload() {
    this.scene.loadAtlas(
      this.name,
      this.textureUrlsOrPaths,
      this.jsonPathOrUrl
    );
  }

  /**
   *
   */
  create() {
    // Make city layers and add a blitter to each
    for (const index of CityLayerIndexes) {
      const layerName = CityLayers[index];
      const layer = this.scene.addLayer(layerName);
      const blitter = this.scene.make.blitter({
        x: 0,
        y: 0,
        key: this.name,
        add: true,
      });
      layer.add(blitter);
      this.blitterMap[index] = blitter;
    }

    // @TODO load faster
    const tileCommands = [];

    console.log((VIEWPORT_WIDTH * 10) / TILE_WIDTH);
    console.log((VIEWPORT_HEIGHT * 10) / TILE_HEIGHT);

    for (let x = 0, xLen = VIEWPORT_WIDTH * 10; x < xLen; x += TILE_WIDTH) {
      for (let y = 0, yLen = VIEWPORT_HEIGHT * 10; y < yLen; y += TILE_HEIGHT) {
        tileCommands.push(
          ((x: number, y: number) => {
            return new Promise(() => {
              this.addTile(CityLayers.building, x, y, 'city1');
            });
          })(x, y)
        );
      }
    }

    Promise.all(tileCommands);

    this.showOnlyLayers([CityLayers.building]);

    // Force the first cull
    this.scene.cameras.main.dirty = true;
  }

  /**
   *
   */
  showOnlyLayers(layerIndexes: number[]) {
    for (const index of CityLayerIndexes) {
      if (layerIndexes.indexOf(index) > -1) {
        this.scene.getLayer(CityLayers[index]).visible = true;
      } else {
        this.scene.getLayer(CityLayers[index]).visible = false;
      }
    }
  }

  /**
   *
   */
  addTile(layerIndex: number, x: number, y: number, name: string) {
    const blitter = this.blitterMap[layerIndex];
    const bob = blitter.create(x, y, name);
    bob.visible = false;
    return bob;
  }

  /**
   *
   */
  getBobCount() {
    let result = 0;

    for (const index of CityLayerIndexes) {
      const layer = this.scene.getLayer(CityLayers[index]);

      if (layer === undefined || layer.visible === false) {
        continue;
      }

      const blitter = this.blitterMap[index];
      result += blitter.children.length;
    }

    return result;
  }

  /**
   *
   */
  update() {
    const now = Date.now();
    if (!this.scene.cameras.main.dirty) {
      return;
    }

    const currentX = this.scene.cameras.main.worldView.x;
    const currentY = this.scene.cameras.main.worldView.y;

    const leftBound = currentX - TILE_WIDTH * 3;
    const rightBound = currentX + VIEWPORT_WIDTH * 1.5 + TILE_WIDTH * 3;
    const upperBound = currentY - TILE_HEIGHT * 3;
    const lowerBound = currentY + VIEWPORT_HEIGHT * 1.5 + TILE_HEIGHT * 3;

    let invis = 0,
      vis = 0;

    for (const index of CityLayerIndexes) {
      if (this.scene.getLayer(CityLayers[index]).visible === false) {
        continue;
      }

      const blitter = this.blitterMap[index];

      for (let i = 0, len = blitter.children.length; i < len; i++) {
        const tile = blitter.children.getAt(i);

        if (tile && tile.x > rightBound) {
          tile.visible = false;
          invis += 1;
        } else {
          tile.visible = true;
          vis += 1;
        }
      }
    }

    document.getElementById('debug').innerHTML = `
    <div>Update: ${Date.now()}</div>
    <div>Time: ${Date.now() - now}</div>
    <div>Current X: ${currentX}</div>
    <div>Current Y: ${currentY}</div>
    <div>Left Bound: ${leftBound}</div>
    <div>Right Bound: ${rightBound}</div>
    <div>Upper Bound: ${upperBound}</div>
    <div>Lower Bound: ${lowerBound}</div>
    <div>Bobs: ${this.getBobCount()}</div>
    <div>Invis: ${invis}</div>
    <div>Vis: ${vis}</div>
  `;
  }

  /**
   *
   */
  makeBuilding(scene: GameScene, stories: number) {
    const group = scene.add.group();
    // const bob = this.addTile(0, 0, 'city0');

    for (let i = 0; i < stories; i++) {
      const story = this.makeStory;
    }
  }

  /**
   *
   */
  makeStory(scene: GameScene) {}

  /**
   *
   */
  makeRoom(scene: GameScene) {}

  /**
   *
   */
  makeStreetRoom(scene: GameScene) {}

  /**
   *
   */
  makeGround(scene: GameScene) {}

  /**
   *
   */
  makeTunnel(scene: GameScene) {}
}
