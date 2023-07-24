import type { CityOptions } from '../city'
import { CityScene } from './cityScene';

export class TestCityScene extends CityScene {
  static key: string = 'testCity';

  constructor() {
    super(TestCityScene.key, [{
      name: 'tiling',
      json: 'assets/tiling.json',
      png: 'assets/tiling.png'
    }], {
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
        width: window.innerWidth,
        height: window.innerHeight,
        x: 0,
        y: 0
      }
    })
  }
}
