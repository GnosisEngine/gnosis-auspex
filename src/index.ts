import './style.css';
import 'phaser';
import { showPerformance } from './performance';
import { GameConfig, GnosisGame } from './game';

/**
 *
 */
function onLoad() {
  const game = new GnosisGame(GameConfig);
  console.log('Engine started.');
}

/**
 *
 */
export const startEngine = (hidePerformance = false) => {
  if (hidePerformance === false) {
    showPerformance();
  }

  console.log('Starting engine...');

  if (window.addEventListener) {
    window.addEventListener('load', onLoad, false);
  } else if ((window as any).attachEvent) {
    (window as any).attachEvent('onload', onLoad);
  } else {
    window.onload = onLoad;
  }
};
