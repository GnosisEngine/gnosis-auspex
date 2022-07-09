import { Game } from 'phaser';
import { GameScene } from '../scenes';

export class AutoTile {
  name: string;
  textureUrlsOrPaths: string[];
  jsonPathOrUrl: string;
  onCreate: (scene: GameScene, autoTile: AutoTile) => AutoTile;

  constructor(
    name: string,
    textureUrlsOrPaths: string[],
    jsonPathOrUrl: string,
    onCreate: () => AutoTile
  ) {
    this.name = name;
    this.textureUrlsOrPaths = textureUrlsOrPaths;
    this.jsonPathOrUrl = jsonPathOrUrl;
    this.onCreate = onCreate;
  }

  /**
   *
   */
  preload(scene: GameScene) {
    scene.loadAtlas(this.name, this.textureUrlsOrPaths, this.jsonPathOrUrl);
  }

  private make() {}

  private cull() {}

  /**
   *
   */
  create(scene: GameScene) {
    this.onCreate(scene, this);
    this.make();
  }

  update(scene: GameScene) {
    const width = scene.game.canvas.width;
    const height = scene.game.canvas.height;
    this.make();
    this.cull();
  }
}
