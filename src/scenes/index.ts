import type { SceneConfig } from '../index.d';
import * as Phaser from 'phaser';
import {
  TILE_HEIGHT,
  TILE_WIDTH,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
} from '../config';
import { CityTile } from '../citytile';

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
    this.cursors = this.input.keyboard.createCursorKeys(); // @TODO more flexible
    this.player = this.physics.add.image(0, 0, 'null'); // @TODO more flexible
    this.physics.add.image(0, 0, 'null'); // @TODO remove

    this.player.setCollideWorldBounds(true); // @TODO more flexible
    this.cameras.main.startFollow(this.player, true); // @TODO more flexible

    this.physics.world.setBounds(
      this.config.bounds.x,
      this.config.bounds.y,
      this.config.bounds.width,
      this.config.bounds.height
    );
    this.cameras.main.setDeadzone(VIEWPORT_WIDTH * 0.3, VIEWPORT_HEIGHT * 0.6);

    this.cityTile.create();

    this.cityTile.lastCameraX = this.cameras.main.worldView.x;
    this.cityTile.lastCameraY = this.cameras.main.worldView.y;
  }

  /**
   *
   */
  update() {
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    }

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
