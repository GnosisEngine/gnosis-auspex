import type { CityOptions } from '../city'
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

    this.tileAtlases = [{
      json: 'assets/tiling.json',
      png: 'assets/tiling.png'
    }]

    // @TODO make this configurable
    this.cityOptions = {
      city: {
        length: 500,
        height: 100
      },
      buildings: {
        minHeight: 100,
        maxHeight: 120,
        minWidth: 15,
        maxWidth: 20,
        minDistance: 0,
        maxDistance: 6,
        averageRoomPopulation: 4
      },
      subway: {
        height: 6,
        onrampDistance: 160,
      },
      fov: {
        width: this.config.width,
        height: this.config.height,
        x: this.config.startX,
        y: this.config.startY
      }
    }
  }
}
