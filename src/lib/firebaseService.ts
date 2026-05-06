import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

export interface ScoreEntry {
  id?: string;
  levelIndex: number;
  moves: number;
  timeLeft: number;
  playerName: string;
  createdAt: Timestamp;
  score: number; // Calculated score for ranking
}

// Calculate a sortable score: higher is better
// We want fewer moves and more time left.
const calculateScore = (moves: number, timeLeft: number) => {
  return (timeLeft * 100) - (moves * 10);
};

export const saveScore = async (levelIndex: number, moves: number, timeLeft: number, playerName: string) => {
  try {
    const score = calculateScore(moves, timeLeft);
    await addDoc(collection(db, "scores"), {
      levelIndex,
      moves,
      timeLeft,
      playerName,
      score,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error adding score: ", e);
  }
};

export const getLeaderboard = async (levelIndex: number, limitCount: number = 5) => {
  try {
    const q = query(
      collection(db, "scores"),
      where("levelIndex", "==", levelIndex),
      orderBy("score", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const leaderboard: ScoreEntry[] = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push({ id: doc.id, ...doc.data() } as ScoreEntry);
    });
    
    return leaderboard;
  } catch (e) {
    console.error("Error fetching leaderboard: ", e);
    return [];
  }
};

export const getPlayerBestRank = async (levelIndex: number, playerName: string) => {
    try {
      // Fetch top 100 to find player's rank
      const q = query(
        collection(db, "scores"),
        where("levelIndex", "==", levelIndex),
        orderBy("score", "desc"),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      let rank = -1;
      let index = 1;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.playerName === playerName && rank === -1) {
          rank = index;
        }
        index++;
      });
      
      return rank;
    } catch (e) {
      console.error("Error fetching player rank: ", e);
      return -1;
    }
};
