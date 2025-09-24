import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/game-store';
import { gameMap, MONSTER_MAP } from '@/lib/game-data';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Heart, Star, Skull, Crown } from 'lucide-react';
const GameTile = ({ type, isPlayerHere }: { type: string | number; isPlayerHere: boolean }) => {
  const baseClasses = "w-8 h-8 flex items-center justify-center text-2xl";
  if (isPlayerHere) return <div className={`${baseClasses} animate-pulse`}><span>@</span></div>;
  switch (type) {
    case 1: return <div className={`${baseClasses} text-gray-500`}>#</div>;
    case 'M1': return <div className={`${baseClasses} animate-bounce`}>🦠</div>;
    case 'M2': return <div className={`${baseClasses} animate-pulse`}>👺</div>;
    case 'M3': return <div className={`${baseClasses}`}>💀</div>;
    case 'B': return <div className={`${baseClasses} text-red-500 animate-glitch`}>🐉</div>;
    default: return <div className={baseClasses}></div>;
  }
};
const PlayerStatsPanel = () => {
  const player = useGameStore((state) => state.player);
  const hpPercentage = (player.hp / player.maxHp) * 100;
  const xpPercentage = (player.xp / player.xpToNextLevel) * 100;
  return (
    <div className="p-4 bg-black/30 border-2 border-rpg-cyan font-pixel flex flex-col space-y-4 text-yellow-50">
      <h2 className="text-2xl text-rpg-cyan text-shadow-glow-cyan">Chrono Hero</h2>
      <div className="text-lg">Level: {player.level}</div>
      <div>
        <div className="flex justify-between text-sm"><span>HP</span><span>{player.hp}/{player.maxHp}</span></div>
        <Progress value={hpPercentage} className="h-4 bg-red-900 border-2 border-red-400 [&>div]:bg-red-500" />
      </div>
      <div>
        <div className="flex justify-between text-sm"><span>XP</span><span>{player.xp}/{player.xpToNextLevel}</span></div>
        <Progress value={xpPercentage} className="h-4 bg-blue-900 border-2 border-blue-400 [&>div]:bg-blue-500" />
      </div>
      <div className="grid grid-cols-2 gap-2 text-base pt-4">
        <div className="flex items-center"><Swords className="w-5 h-5 mr-2 text-rpg-pink" /> ATK: {player.attack}</div>
        <div className="flex items-center"><Shield className="w-5 h-5 mr-2 text-rpg-cyan" /> DEF: {player.defense}</div>
      </div>
    </div>
  );
};
const MessageLog = () => {
  const messages = useGameStore((state) => state.messages);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);
  return (
    <div ref={logRef} className="p-4 bg-black/30 border-2 border-rpg-cyan font-pixel h-32 overflow-y-auto text-sm text-yellow-50 leading-relaxed">
      {messages.map((msg, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          &gt; {msg}
        </motion.p>
      ))}
    </div>
  );
};
const GameView = () => {
  const { gameState, player, map: currentMap, combat } = useGameStore((state) => ({
    gameState: state.gameState,
    player: state.player,
    map: state.map,
    combat: state.combat,
  }));
  const attack = useGameStore((state) => state.attack);
  if (gameState === 'exploring') {
    return (
      <div className="bg-black/50 p-4 flex items-center justify-center h-full">
        <div className="grid grid-cols-15 font-mono leading-none" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
          {currentMap.map((row, y) =>
            row.map((tile, x) => (
              <GameTile key={`${x}-${y}`} type={tile} isPlayerHere={player.position.x === x && player.position.y === y} />
            ))
          )}
        </div>
      </div>
    );
  }
  if (gameState === 'combat' && combat.monster) {
    const monsterHpPercentage = (combat.monsterHp / combat.monster.hp) * 100;
    return (
      <div className="bg-black/50 p-4 flex flex-col items-center justify-around font-pixel text-yellow-50 h-full">
        <div className="text-center">
          <motion.div
            className="text-8xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {combat.monster.sprite}
          </motion.div>
          <h3 className="text-2xl text-rpg-pink text-shadow-glow-pink">{combat.monster.name}</h3>
          <div className="w-48 mx-auto mt-2">
            <Progress value={monsterHpPercentage} className="h-4 bg-green-900 border-2 border-green-400 [&>div]:bg-green-500" />
            <p className="text-sm">{combat.monsterHp}/{combat.monster.hp}</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button
            onClick={attack}
            disabled={!combat.playerTurn}
            className="font-pixel rounded-none border-2 border-rpg-pink bg-rpg-pink/20 text-rpg-pink hover:bg-rpg-pink/40 hover:text-shadow-glow-pink shadow-pixel-hard hover:shadow-pixel-hard-hover active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            Attack
          </Button>
        </div>
      </div>
    );
  }
  return null;
};
const GameOverlays = () => {
  const { gameState, startGame, closeLevelUp, player } = useGameStore((state) => ({
    gameState: state.gameState,
    startGame: state.startGame,
    closeLevelUp: state.closeLevelUp,
    player: state.player,
  }));
  const overlayBaseClasses = "absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center font-pixel text-center p-8";
  return (
    <AnimatePresence>
      {gameState === 'gameOver' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={overlayBaseClasses}
        >
          <Skull className="w-24 h-24 text-red-500 mb-4" />
          <h2 className="text-6xl text-red-500 text-shadow-glow-pink mb-8">GAME OVER</h2>
          <Button onClick={startGame} className="font-pixel text-xl rounded-none border-2 border-rpg-cyan bg-rpg-cyan/20 text-rpg-cyan hover:bg-rpg-cyan/40 hover:text-shadow-glow-cyan">
            Restart
          </Button>
        </motion.div>
      )}
      {gameState === 'victory' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={overlayBaseClasses}
        >
          <Crown className="w-24 h-24 text-yellow-400 mb-4" />
          <h2 className="text-6xl text-yellow-400 text-shadow-glow-cyan mb-8">VICTORY!</h2>
          <p className="text-xl text-yellow-50 mb-8">You have saved the timeline!</p>
          <Button onClick={startGame} className="font-pixel text-xl rounded-none border-2 border-rpg-cyan bg-rpg-cyan/20 text-rpg-cyan hover:bg-rpg-cyan/40 hover:text-shadow-glow-cyan">
            Play Again
          </Button>
        </motion.div>
      )}
      {gameState === 'levelUp' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className={overlayBaseClasses}
        >
          <Star className="w-24 h-24 text-yellow-400 mb-4 animate-ping" />
          <h2 className="text-6xl text-yellow-400 text-shadow-glow-cyan mb-8">LEVEL UP!</h2>
          <div className="text-2xl text-yellow-50 space-y-2 mb-8">
            <p>You are now Level {player.level}!</p>
            <p className="flex items-center justify-center"><Heart className="w-6 h-6 mr-2 text-red-500"/> Max HP: {player.maxHp}</p>
            <p className="flex items-center justify-center"><Swords className="w-6 h-6 mr-2 text-rpg-pink"/> Attack: {player.attack}</p>
            <p className="flex items-center justify-center"><Shield className="w-6 h-6 mr-2 text-rpg-cyan"/> Defense: {player.defense}</p>
          </div>
          <Button onClick={closeLevelUp} className="font-pixel text-xl rounded-none border-2 border-rpg-cyan bg-rpg-cyan/20 text-rpg-cyan hover:bg-rpg-cyan/40 hover:text-shadow-glow-cyan">
            Continue
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export function HomePage() {
  const movePlayer = useGameStore((state) => state.movePlayer);
  useHotkeys('arrowup', () => movePlayer(0, -1), { preventDefault: true });
  useHotkeys('arrowdown', () => movePlayer(0, 1), { preventDefault: true });
  useHotkeys('arrowleft', () => movePlayer(-1, 0), { preventDefault: true });
  useHotkeys('arrowright', () => movePlayer(1, 0), { preventDefault: true });
  return (
    <main className="min-h-screen bg-rpg-dark flex items-center justify-center p-4 font-pixel crt-overlay">
      <div className="w-full max-w-4xl mx-auto relative">
        <h1 className="text-4xl text-center mb-4 text-rpg-cyan text-shadow-glow-cyan">ChronoQuest</h1>
        <div className="grid grid-cols-3 grid-rows-[minmax(0,2fr)_minmax(0,1fr)] gap-4 h-[70vh]">
          <div className="col-span-2 row-span-1 border-2 border-rpg-cyan">
            <GameView />
          </div>
          <div className="col-span-1 row-span-1">
            <PlayerStatsPanel />
          </div>
          <div className="col-span-3 row-span-1">
            <MessageLog />
          </div>
        </div>
        <GameOverlays />
        <footer className="text-center text-rpg-cyan/50 mt-4 text-xs">
          Built with ❤�� at Cloudflare
        </footer>
      </div>
    </main>
  );
}