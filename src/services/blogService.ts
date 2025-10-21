import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { BlogPost, BlogReply } from '../types/blog';

const POSTS_COLLECTION = 'blog-posts';
const REPLIES_COLLECTION = 'blog-replies';

// ===== Blog Post Functions =====

// Create a new blog post
export const createBlogPost = async (post: BlogPost): Promise<void> => {
  const postRef = doc(db, POSTS_COLLECTION, post.id);
  await setDoc(postRef, post);
};

// Get all blog posts ordered by timestamp (newest first)
export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(postsRef, orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const posts: BlogPost[] = [];
  querySnapshot.forEach((doc) => {
    posts.push(doc.data() as BlogPost);
  });
  
  return posts;
};

// Get blog posts filtered by game
export const getBlogPostsByGame = async (game: string): Promise<BlogPost[]> => {
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(
    postsRef,
    where('game', '==', game)
  );
  const querySnapshot = await getDocs(q);
  
  const posts: BlogPost[] = [];
  querySnapshot.forEach((doc) => {
    posts.push(doc.data() as BlogPost);
  });
  
  // Sort by timestamp on the client side (newest first)
  return posts.sort((a, b) => b.timestamp - a.timestamp);
};

// Get a specific blog post by ID
export const getBlogPost = async (postId: string): Promise<BlogPost | null> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    return postSnap.data() as BlogPost;
  }
  
  return null;
};

// Update a blog post
export const updateBlogPost = async (
  postId: string,
  updates: Partial<BlogPost>
): Promise<void> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, updates);
};

// Delete a blog post and all its replies
export const deleteBlogPost = async (postId: string): Promise<void> => {
  const batch = writeBatch(db);
  
  // Delete the post
  const postRef = doc(db, POSTS_COLLECTION, postId);
  batch.delete(postRef);
  
  // Delete all replies to this post
  const repliesRef = collection(db, REPLIES_COLLECTION);
  const q = query(repliesRef, where('postId', '==', postId));
  const querySnapshot = await getDocs(q);
  
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
};

// Toggle like on a blog post
export const toggleBlogPostLike = async (
  postId: string,
  userId: string
): Promise<void> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    const post = postSnap.data() as BlogPost;
    const likes = post.likes || [];
    
    const updatedLikes = likes.includes(userId)
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];
    
    await updateDoc(postRef, { likes: updatedLikes });
  }
};

// ===== Blog Reply Functions =====

// Create a new reply to a blog post
export const createBlogReply = async (reply: BlogReply): Promise<void> => {
  const batch = writeBatch(db);
  
  // Add the reply
  const replyRef = doc(db, REPLIES_COLLECTION, reply.id);
  batch.set(replyRef, reply);
  
  // Increment the reply count on the post
  const postRef = doc(db, POSTS_COLLECTION, reply.postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    const post = postSnap.data() as BlogPost;
    batch.update(postRef, { replyCount: (post.replyCount || 0) + 1 });
  }
  
  await batch.commit();
};

// Get all replies for a specific post ordered by timestamp (oldest first)
export const getRepliesForPost = async (postId: string): Promise<BlogReply[]> => {
  const repliesRef = collection(db, REPLIES_COLLECTION);
  const q = query(
    repliesRef,
    where('postId', '==', postId)
  );
  const querySnapshot = await getDocs(q);
  
  const replies: BlogReply[] = [];
  querySnapshot.forEach((doc) => {
    replies.push(doc.data() as BlogReply);
  });
  
  // Sort by timestamp on the client side (oldest first)
  return replies.sort((a, b) => a.timestamp - b.timestamp);
};

// Update a reply
export const updateBlogReply = async (
  replyId: string,
  updates: Partial<BlogReply>
): Promise<void> => {
  const replyRef = doc(db, REPLIES_COLLECTION, replyId);
  await updateDoc(replyRef, updates);
};

// Delete a reply
export const deleteBlogReply = async (replyId: string, postId: string): Promise<void> => {
  const batch = writeBatch(db);
  
  // Delete the reply
  const replyRef = doc(db, REPLIES_COLLECTION, replyId);
  batch.delete(replyRef);
  
  // Decrement the reply count on the post
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    const post = postSnap.data() as BlogPost;
    batch.update(postRef, { replyCount: Math.max((post.replyCount || 0) - 1, 0) });
  }
  
  await batch.commit();
};

// Toggle like on a reply
export const toggleBlogReplyLike = async (
  replyId: string,
  userId: string
): Promise<void> => {
  const replyRef = doc(db, REPLIES_COLLECTION, replyId);
  const replySnap = await getDoc(replyRef);
  
  if (replySnap.exists()) {
    const reply = replySnap.data() as BlogReply;
    const likes = reply.likes || [];
    
    const updatedLikes = likes.includes(userId)
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];
    
    await updateDoc(replyRef, { likes: updatedLikes });
  }
};

