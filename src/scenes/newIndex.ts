import type { SceneConfig } from '../index.d';
import * as Phaser from 'phaser';
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
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  config: SceneConfig;
  mainCamera: Camera
  debugView: DebugView;
	ready: boolean;

  constructor(config: SceneConfig) {
    super(config);
    this.config = config;
    this.layers = {};
    this.containers = {};
    this.ready = false;
  }

  /**
   *
   */
  async create() {
    this.player = new Player(this.physics, this.config)
    this.cursors = this.input.keyboard.createCursorKeys(); // @TODO more flexible
    this.debugView = new DebugView(this)
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
    this.debugView.update(this.player)
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
}
