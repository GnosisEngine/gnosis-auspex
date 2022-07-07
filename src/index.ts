// Import stylesheets
import './style.css';

import { showPerformance } from './performance';
import 'phaser';
import { GameConfig, GnosisGame } from './game';

export const onReady = () => {
  window.onload = () => {
    const game = new GnosisGame(GameConfig);
  };

  showPerformance();
};
