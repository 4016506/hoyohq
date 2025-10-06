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
import type { HSRUser, HSRUserCharacter } from '../types/hsr-character';

const USERS_COLLECTION = 'users';
const HSR_USERS_COLLECTION = 'hsr-users';

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

// ===== Honkai Star Rail Functions =====

// Create or update an HSR user
export const saveHSRUser = async (user: HSRUser): Promise<void> => {
  const userRef = doc(db, HSR_USERS_COLLECTION, user.id);
  await setDoc(userRef, user);
};

// Get all HSR users
export const getAllHSRUsers = async (): Promise<HSRUser[]> => {
  const usersRef = collection(db, HSR_USERS_COLLECTION);
  const querySnapshot = await getDocs(usersRef);
  
  const users: HSRUser[] = [];
  querySnapshot.forEach((doc) => {
    users.push(doc.data() as HSRUser);
  });
  
  return users;
};

// Get a specific HSR user by ID
export const getHSRUser = async (userId: string): Promise<HSRUser | null> => {
  const userRef = doc(db, HSR_USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as HSRUser;
  }
  
  return null;
};

// Update an HSR user's character data
export const updateHSRUserCharacter = async (
  userId: string, 
  characterId: string, 
  characterData: HSRUserCharacter
): Promise<void> => {
  const userRef = doc(db, HSR_USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const user = userSnap.data() as HSRUser;
    const updatedCharacters = {
      ...user.characters,
      [characterId]: characterData
    };
    
    await updateDoc(userRef, {
      characters: updatedCharacters
    });
  }
};

// Delete an HSR user
export const deleteHSRUser = async (userId: string): Promise<void> => {
  const userRef = doc(db, HSR_USERS_COLLECTION, userId);
  await deleteDoc(userRef);
};
