import { GameScene } from '.';
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from '../config';

export class ExampleScene extends GameScene {
  static key: string = 'example';

  constructor() {
    super({
      key: ExampleScene.key,
      bounds: {
        x: VIEWPORT_WIDTH / -2,
        y: VIEWPORT_WIDTH / -2,
        width: VIEWPORT_WIDTH * 3,
        height: VIEWPORT_HEIGHT * 3,
      },
      defaultTilePaths: [
        'https://raw.githubusercontent.com/GnosisEngine/gnosis-auspex/main/assets/tiling.png',
      ],
      defaultTileConfigPath:
        'https://raw.githubusercontent.com/GnosisEngine/gnosis-auspex/main/assets/tiling.json',
    });
  }
}
