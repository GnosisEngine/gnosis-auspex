import type { SceneConfig } from '../index.d';
import * as Phaser from 'phaser';
import {
  CAMERA_DEADZONE_HEIGHT,
  CAMERA_DEADZONE_WIDTH,
  FOV_HEIGHT,
  FOV_WIDTH,
} from '../config';
import { CityTile } from '../citytile';
import Camera from '../camera'
import Player from '../player'
import Physics from '../physics'
import DebugView from '../debugView'

interface Layers {
  [key: string]: Phaser.GameObjects.Layer;
}

interface Containers {
  [key: string]: Phaser.GameObjects.Container;
}

export class GameScene extends Phaser.Scene {
  layers: Layers;
  containers: Containers;
  loadedSprites = [];
  defaultTilePaths: string[];
  defaultTileConfigPath: string;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  config: SceneConfig;
  cityTile: CityTile;
  ready: boolean;
  mainCamera: Camera
  debugContainer: DebugView;

  constructor(config: SceneConfig) {
    super(config);
    this.config = config;
    this.layers = {};
    this.containers = {};
    this.cityTile = new CityTile(
      this,
      'atlas',
      this.config.defaultTilePaths,
      this.config.defaultTileConfigPath
    );
    this.ready = false;
  }

  /**
   *
   */
  preload() {
    this.cityTile.preload();
  }

  /**
   *
   */
  async create() {
    this.player = new Player(this.physics, this.config)
    // @TODO: Renderer
    this.cityTile.create();
    this.cursors = this.input.keyboard.createCursorKeys(); // @TODO more flexible
    this.debugContainer = new DebugView(this)
    this.camera = new Camera(this.cameras.main)
    this.ready = await this.camera.initialize(this.player)
  }

  /**
   *
   */
  update() {
    if (this.ready === false) {
      return;
    }

    this.player.update(this.cursors)
    this.debugContainer.update(this.player)
    this.cityTile.update();
  }

  /**
   *
   */
  loadAtlas(
    name: string,
    texturePathsOrUrls: string[],
    atlasJsonPathsOrUrls: string
  ) {
    const result = this.load.atlas(
      name,
      texturePathsOrUrls,
      atlasJsonPathsOrUrls
    );
    return result;
  }

  /**
   *
   */
  loadSprite(
    config: Phaser.Types.GameObjects.Sprite.SpriteConfig,
    path: string
  ) {
    this.load.image(config.key, path);
  }

  /**
   *
   */
  addLayer(name: string, children: Phaser.GameObjects.GameObject[] = []) {
    const layer = this.add.layer(children);
    layer.setName(name);
    this.layers[name] = layer;
    return layer;
  }

  /**
   *
   */
  addContainer(
    containerName: string,
    layerName: string,
    x: number = 0,
    y: number = 0,
    children: Phaser.GameObjects.GameObject[] = []
  ) {
    const container = this.add.container(x, y, children);
    this.containers[containerName] = container;
    const layer = this.getLayer(layerName);
    layer.add(container);
    return container;
  }

  /**
   *
   */
  getLayer(name: string) {
    return this.layers[name];
  }

  /**
   *
   */
  getContainer(name: string) {
    return this.containers[name];
  }

  /**
   *
   */
  addSpriteToLayer(
    layerName: string,
    spriteConfigs:
      | Phaser.Types.GameObjects.Sprite.SpriteConfig[]
      | Phaser.GameObjects.Sprite[]
  ) {
    const layer = this.getLayer(layerName);
    const result: Phaser.GameObjects.Sprite[] = [];

    for (const config of spriteConfigs) {
      const sprite =
        config instanceof Phaser.GameObjects.Sprite
          ? config
          : this.make.sprite(config, false);

      layer.add(sprite);
      result.push(sprite);
    }

    return result;
  }

  /**
   *
   */
  addSpritesToContainer(
    name: string,
    spriteConfigs:
      | Phaser.Types.GameObjects.Sprite.SpriteConfig[]
      | Phaser.GameObjects.Sprite[]
  ) {
    const container = this.getContainer(name);
    const result: Phaser.GameObjects.Sprite[] = [];

    for (const config of spriteConfigs) {
      const sprite =
        config instanceof Phaser.GameObjects.Sprite
          ? config
          : this.make.sprite(config, false);

      container.add(sprite);
      result.push(sprite);
    }

    return result;
  }
}
