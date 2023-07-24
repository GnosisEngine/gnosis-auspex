import './style.css';
import 'phaser';
import { gameConfig, GnosisGame } from './game';

/**
 *
 */
async function onLoad (onReady: () => Promise<void> = async () => undefined) {
  const game = new GnosisGame(gameConfig, onReady)
  await game.startEngine()
  console.log('Engine started.');
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
