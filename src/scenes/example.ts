import { GameScene } from '.';

export class ExampleScene extends Phaser.Scene {
  static key: string = 'example';

  constructor() {
    super({
      key: ExampleScene.key,
    });
  }
}
