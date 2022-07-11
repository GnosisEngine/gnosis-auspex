import './style.css';
import 'phaser';
import { showPerformance } from './performance';
import { gameConfig, GnosisGame } from './game';
import { ExampleScene } from './scenes/example';

/**
 *
 */
async function onLoad(onReady: () => Promise<void> = async () => undefined) {
  return new Promise((resolve) => {
    const game = new GnosisGame(gameConfig, async () => {
      // @TODO: Make this JSONable
      const scene = game.getScene(ExampleScene.key);
      const layer = scene.addLayer('test');
      const container = scene.addContainer('box', 'test', 0, 0);

      await onReady();
      resolve(game);
      console.log('Engine started.');
    });
  });
}

/**
 *
 */
export const startEngine = async (loadCanvas = false) => {
  if (gameConfig.debug) {
    showPerformance();
  }

  console.log('Starting engine...');

  if (loadCanvas) {
    await onLoad();
  } else if (window.addEventListener) {
    window.addEventListener('load', async () => onLoad(), false);
  } else if ((window as any).attachEvent) {
    (window as any).attachEvent('onload', async () => onLoad());
  } else {
    window.onload = async () => onLoad();
  }
};
