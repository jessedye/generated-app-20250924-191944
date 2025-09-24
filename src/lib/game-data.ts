export type Monster = {
  id: string;
  name: string;
  sprite: string;
  hp: number;
  attack: number;
  defense: number;
  xp: number;
};
export const MONSTERS: Record<string, Monster> = {
  slime: {
    id: 'slime',
    name: 'Slime',
    sprite: '🦠',
    hp: 10,
    attack: 3,
    defense: 1,
    xp: 5,
  },
  goblin: {
    id: 'goblin',
    name: 'Goblin',
    sprite: '👺',
    hp: 15,
    attack: 5,
    defense: 2,
    xp: 10,
  },
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    sprite: '💀',
    hp: 25,
    attack: 8,
    defense: 4,
    xp: 20,
  },
  dragon: {
    id: 'dragon',
    name: 'Chrono Dragon',
    sprite: '🐉',
    hp: 100,
    attack: 15,
    defense: 10,
    xp: 100,
  },
};
export const MAP_WIDTH = 15;
export const MAP_HEIGHT = 10;
// 0: empty, 1: wall, M1: slime, M2: goblin, M3: skeleton, B: boss
export const gameMap: (number | string)[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 'M1', 0, 1, 0, 0, 0, 0, 1, 0, 'M2', 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 'M1', 1, 0, 1, 1, 1, 'M3', 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 'M2', 1],
  [1, 0, 0, 'M2', 0, 0, 1, 'B', 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
export const MONSTER_MAP: Record<string, string> = {
  'M1': 'slime',
  'M2': 'goblin',
  'M3': 'skeleton',
  'B': 'dragon',
};