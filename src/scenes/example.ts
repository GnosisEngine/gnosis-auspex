import { GameScene } from '.';

export class ExampleScene extends GameScene {
  static key: string = 'example';

  constructor() {
    super({
      key: ExampleScene.key,
    });
  }
}
