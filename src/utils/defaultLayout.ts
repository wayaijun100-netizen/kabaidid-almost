import { ScoreboardUILayout } from '../types';

export const DEFAULT_LAYOUT: ScoreboardUILayout = {
  team1Name: {
    x: 20,
    y: 22,
    width: 340,
    height: 75,
    zIndex: 10,
  },
  team1Score: {
    x: 20,
    y: 55,
    width: 340,
    height: 320,
    zIndex: 10,
  },
  timer: {
    x: 50,
    y: 50,
    width: 320,
    height: 320,
    zIndex: 15,
  },
  team2Name: {
    x: 80,
    y: 22,
    width: 340,
    height: 75,
    zIndex: 10,
  },
  team2Score: {
    x: 80,
    y: 55,
    width: 340,
    height: 320,
    zIndex: 10,
  },
};
