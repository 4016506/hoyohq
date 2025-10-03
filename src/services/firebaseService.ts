import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, UserCharacter } from '../types/character';

const USERS_COLLECTION = 'users';

// Create or update a user
export const saveUser = async (user: User): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, user.id);
  await setDoc(userRef, user);
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const querySnapshot = await getDocs(usersRef);
  
  const users: User[] = [];
  querySnapshot.forEach((doc) => {
    users.push(doc.data() as User);
  });
  
  return users;
};

// Get a specific user by ID
export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  
  return null;
};

// Update a user's character data
export const updateUserCharacter = async (
  userId: string, 
  characterId: string, 
  characterData: UserCharacter
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const user = userSnap.data() as User;
    const updatedCharacters = {
      ...user.characters,
      [characterId]: characterData
    };
    
    await updateDoc(userRef, {
      characters: updatedCharacters
    });
  }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(userRef);
};
