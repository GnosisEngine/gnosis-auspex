import { GameScene } from '.';

export class ExampleScene extends GameScene {
  static key: string = 'example';

  constructor() {
    super({
      key: ExampleScene.key,
      bounds: {
        x: -1024,
        y: -1024,
        width: 1024 * 20,
        height: 1024 * 20,
      },
      defaultTilePaths: [
        'https://raw.githubusercontent.com/GnosisEngine/gnosis-auspex/main/assets/tiling.png',
      ],
      defaultTileConfigPath:
        'https://raw.githubusercontent.com/GnosisEngine/gnosis-auspex/main/assets/tiling.json',
    });
  }
}
