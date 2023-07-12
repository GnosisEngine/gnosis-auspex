import './style.css';
import 'phaser';
import { gameConfig, GnosisGame } from './game';
import { ExampleScene } from './scenes/example';

/**
 *
 */
// async function onLoad (onReady: () => Promise<void> = async () => undefined) {
//   const game = new GnosisGame(gameConfig, onReady)
//   await game.start()
//   console.log('Engine started.');
// }

async function onLoad(onReady: () => Promise<void> = async () => undefined) {
  return new Promise((resolve) => {
    const game = new GnosisGame(gameConfig, async () => {
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
  console.log('Starting engine...');

  if (loadCanvas) {
    await onLoad();
  } else if (window.addEventListener) {
    window.addEventListener('load', onLoad, false);
  } else if ((window as any).attachEvent) {
    (window as any).attachEvent('onload', onLoad);
  } else {
    window.onload = onLoad;
  }
};
