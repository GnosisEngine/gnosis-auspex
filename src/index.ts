import './style.css';
import 'phaser';
import { showPerformance } from './performance';
import { GameConfig, GnosisGame } from './game';
import { ExampleScene } from './scenes/example';

/**
 *
 */
function onLoad() {
  const game = new GnosisGame(GameConfig);
  const scene = game.getScene(ExampleScene.key);
  console.log(scene);
  //scene.addLayer('test');
  console.log('Engine started.');
  return game;
}

/**
 *
 */
export const startEngine = (hidePerformance = false, loadCanvas = false) => {
  if (hidePerformance === false) {
    showPerformance();
  }

  console.log('Starting engine...');

  if (loadCanvas) {
    onLoad();
  } else if (window.addEventListener) {
    window.addEventListener('load', onLoad, false);
  } else if ((window as any).attachEvent) {
    (window as any).attachEvent('onload', onLoad);
  } else {
    window.onload = onLoad;
  }
};
