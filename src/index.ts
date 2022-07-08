import './style.css';
import 'phaser';
import { showPerformance } from './performance';
import { GameConfig, GnosisGame } from './game';

export const startEngine = (hidePerformance = false) => {
  if (hidePerformance === false) {
    showPerformance();
  }

  window.onload = () => {
    const game = new GnosisGame(GameConfig);
  };
};
