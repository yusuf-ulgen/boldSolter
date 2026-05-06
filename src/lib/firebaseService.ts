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
  // Score = Remaining Time (seconds) * (1000 / Move count)
  // Fewer moves = higher multiplier for time
  return Math.floor(timeLeft * (1000 / Math.max(1, moves)));
};

export const saveScore = async (levelIndex: number, moves: number, timeLeft: number, playerName: string) => {
  try {
    const score = calculateScore(moves, timeLeft);
    const scoresRef = collection(db, "scores");
    
    // Check for existing score for this player on this level
    const q = query(
      scoresRef,
      where("levelIndex", "==", levelIndex),
      where("playerName", "==", playerName)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingDoc = querySnapshot.docs[0];
      const existingData = existingDoc.data();
      
      // Only update if the new score is better
      if (score > existingData.score) {
        const { updateDoc, doc } = await import("firebase/firestore");
        await updateDoc(doc(db, "scores", existingDoc.id), {
          moves,
          timeLeft,
          score,
          updatedAt: serverTimestamp()
        });
      }
    } else {
      await addDoc(scoresRef, {
        levelIndex,
        moves,
        timeLeft,
        playerName,
        score,
        createdAt: serverTimestamp(),
      });
    }
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

// Migration function to update old scores to new formula
export const migrateScores = async () => {
  try {
    const scoresRef = collection(db, "scores");
    const querySnapshot = await getDocs(scoresRef);
    
    console.log(`Starting migration and cleanup for ${querySnapshot.size} records...`);
    
    const processedKeys = new Set<string>();
    const toDelete: string[] = [];
    
    // Sort all records by score DESC first to keep the best one in our processing
    const allRecords = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    allRecords.sort((a, b) => b.score - a.score);

    for (const record of allRecords) {
      const key = `${record.playerName}_${record.levelIndex}`;
      
      if (processedKeys.has(key)) {
        // Already have a better or equal score for this player/level, mark for deletion
        toDelete.push(record.id);
        continue;
      }
      
      processedKeys.add(key);
      
      // Recalculate score for the kept record
      const newScore = calculateScore(record.moves, record.timeLeft);
      if (record.score !== newScore) {
        const { doc, updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "scores", record.id), {
          score: newScore
        });
      }
    }
    
    // Delete duplicates
    const { doc, deleteDoc } = await import("firebase/firestore");
    for (const id of toDelete) {
      await deleteDoc(doc(db, "scores", id));
    }
    
    console.log(`Migration completed. Kept ${processedKeys.size} records, deleted ${toDelete.length} duplicates.`);
    return true;
  } catch (e) {
    console.error("Migration failed: ", e);
    return false;
  }
};

export const isNicknameAvailable = async (nickname: string) => {
  try {
    const q = query(collection(db, "scores"), where("playerName", "==", nickname), limit(1));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (e) {
    console.error("Error checking nickname: ", e);
    return true; // Assume available on error to not block user
  }
};


export const getPlayerRanks = async (playerName: string) => {
  try {
    const { getCountFromServer } = await import("firebase/firestore");
    
    // 1. Get all player's scores
    const scoresRef = collection(db, "scores");
    const q = query(scoresRef, where("playerName", "==", playerName));
    const querySnapshot = await getDocs(q);
    
    const ranks: Record<number, number> = {};
    
    // 2. For each score, count how many are better
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const levelIdx = data.levelIndex;
      const score = data.score;
      
      const betterScoresQuery = query(
        scoresRef, 
        where("levelIndex", "==", levelIdx), 
        where("score", ">", score)
      );
      
      const countSnapshot = await getCountFromServer(betterScoresQuery);
      ranks[levelIdx] = countSnapshot.data().count + 1;
    }
    
    return ranks;
  } catch (e) {
    console.error("Error fetching player ranks: ", e);
    return {};
  }
};
