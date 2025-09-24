import { create } from 'zustand';
import { MONSTERS, gameMap, MONSTER_MAP, MAP_WIDTH, MAP_HEIGHT } from './game-data';
import type { Monster } from './game-data';
type GameState = 'exploring' | 'combat' | 'gameOver' | 'victory' | 'levelUp';
type Player = {
  hp: number;
  maxHp: number;
  xp: number;
  xpToNextLevel: number;
  level: number;
  attack: number;
  defense: number;
  position: { x: number; y: number };
};
type CombatState = {
  monster: Monster | null;
  monsterHp: number;
  playerTurn: boolean;
};
type StoreState = {
  player: Player;
  gameState: GameState;
  messages: string[];
  combat: CombatState;
  map: (number | string)[][];
};
type StoreActions = {
  startGame: () => void;
  movePlayer: (dx: number, dy: number) => void;
  attack: () => void;
  addMessage: (message: string) => void;
  closeLevelUp: () => void;
};
const initialState: StoreState = {
  player: {
    hp: 50,
    maxHp: 50,
    xp: 0,
    xpToNextLevel: 20,
    level: 1,
    attack: 5,
    defense: 3,
    position: { x: 1, y: 1 },
  },
  gameState: 'exploring',
  messages: ['Welcome to ChronoQuest! Use arrow keys to move.'],
  combat: {
    monster: null,
    monsterHp: 0,
    playerTurn: true,
  },
  map: JSON.parse(JSON.stringify(gameMap)), // Deep copy
};
export const useGameStore = create<StoreState & StoreActions>((set, get) => ({
  ...initialState,
  startGame: () => set({ ...initialState, map: JSON.parse(JSON.stringify(gameMap)), messages: ['Welcome to ChronoQuest! Use arrow keys to move.'] }),
  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages.slice(-9), message] }));
  },
  movePlayer: (dx, dy) => {
    const { gameState, player, map } = get();
    if (gameState !== 'exploring') return;
    const newX = player.position.x + dx;
    const newY = player.position.y + dy;
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) return;
    const tile = map[newY][newX];
    if (tile === 1) {
      get().addMessage("A wall blocks your path.");
      return;
    }
    set((state) => ({ player: { ...state.player, position: { x: newX, y: newY } } }));
    if (typeof tile === 'string' && MONSTER_MAP[tile]) {
      const monsterId = MONSTER_MAP[tile];
      const monsterData = MONSTERS[monsterId];
      // Start combat
      set((state) => {
        const newMap = JSON.parse(JSON.stringify(state.map)); // Deep copy to avoid mutation issues
        newMap[newY][newX] = 0; // Remove monster from map
        return {
          gameState: 'combat',
          combat: {
            monster: monsterData,
            monsterHp: monsterData.hp,
            playerTurn: true,
          },
          map: newMap,
        };
      });
      get().addMessage(`A wild ${monsterData.name} appears!`);
    }
  },
  attack: () => {
    const { gameState, combat, player } = get();
    if (gameState !== 'combat' || !combat.monster || !combat.playerTurn) return;
    set(state => ({ combat: {...state.combat, playerTurn: false }}));
    // Player attacks monster
    const playerDamage = Math.max(1, player.attack - combat.monster.defense + Math.floor(Math.random() * 3) - 1);
    const newMonsterHp = Math.max(0, combat.monsterHp - playerDamage);
    get().addMessage(`You attack the ${combat.monster.name} for ${playerDamage} damage.`);
    set(state => ({ combat: {...state.combat, monsterHp: newMonsterHp }}));
    if (newMonsterHp <= 0) {
      // Monster defeated
      get().addMessage(`You defeated the ${combat.monster.name}!`);
      get().addMessage(`You gain ${combat.monster.xp} XP.`);
      const newXp = player.xp + combat.monster.xp;
      let newPlayerState = { ...player, xp: newXp };
      let leveledUp = false;
      if (newXp >= player.xpToNextLevel) {
        leveledUp = true;
        // Level up
        newPlayerState.level += 1;
        newPlayerState.xp = newXp - player.xpToNextLevel;
        newPlayerState.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
        newPlayerState.maxHp += 10;
        newPlayerState.hp = newPlayerState.maxHp;
        newPlayerState.attack += 2;
        newPlayerState.defense += 1;
        set({ gameState: 'levelUp', player: newPlayerState });
        get().addMessage("LEVEL UP! Your stats have increased!");
      } else {
        set({ player: newPlayerState });
      }
      if (combat.monster.id === 'dragon') {
        set({ gameState: 'victory' });
        get().addMessage("You defeated the Chrono Dragon! You are victorious!");
      } else if (!leveledUp) {
         set({ gameState: 'exploring', combat: { ...initialState.combat } });
      }
      return;
    }
    // Monster attacks player (after a delay)
    setTimeout(() => {
      const { combat: currentCombat, player: currentPlayer } = get();
      if (get().gameState !== 'combat' || !currentCombat.monster) return;
      const monsterDamage = Math.max(1, currentCombat.monster.attack - currentPlayer.defense + Math.floor(Math.random() * 3) - 1);
      const newPlayerHp = Math.max(0, currentPlayer.hp - monsterDamage);
      get().addMessage(`The ${currentCombat.monster.name} attacks you for ${monsterDamage} damage.`);
      set(state => ({ player: {...state.player, hp: newPlayerHp }}));
      if (newPlayerHp <= 0) {
        // Player defeated
        set({ gameState: 'gameOver' });
        get().addMessage("You have been defeated. Game Over.");
      } else {
        set(state => ({ combat: {...state.combat, playerTurn: true }}));
      }
    }, 1000);
  },
  closeLevelUp: () => {
    set({ gameState: 'exploring', combat: { ...initialState.combat } });
  }
}));