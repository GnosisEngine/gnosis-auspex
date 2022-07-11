export interface GameConfig extends Phaser.Types.Core.GameConfig {
  debug: true;
}

export interface SceneConfig extends Phaser.Types.Scenes.SettingsConfig {
  defaultTilePaths: string[];
  defaultTileConfigPath: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
