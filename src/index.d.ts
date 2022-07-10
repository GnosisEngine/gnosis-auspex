export interface GameConfig extends Phaser.Types.Core.GameConfig {}

export interface SceneConfig extends Phaser.Types.Scenes.SettingsConfig {
  defaultTilePaths: string[];
  defaultTileConfigPath: string;
}
