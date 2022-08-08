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
        width: Infinity,
        height: Infinity,
      },
      defaultTilePaths: [
        'assets/tiling.png',
        // 'https://raw.githubusercontent.com/GnosisEngine/gnosis-auspex/main/assets/tiling.png',
      ],
      defaultTileConfigPath:
        'assets/tiling.json',
        // 'https://raw.githubusercontent.com/GnosisEngine/gnosis-auspex/main/assets/tiling.json',
    });
  }
}
