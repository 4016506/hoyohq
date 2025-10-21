import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/character';
import type { HSRUser } from '../types/hsr-character';
import type { BlogPost, BlogReply, GameTag, BlogUser } from '../types/blog';
import { getAllUsers } from '../services/firebaseService';
import { getAllHSRUsers } from '../services/firebaseService';
import {
  getAllBlogPosts,
  getBlogPostsByGame,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  toggleBlogPostLike,
  createBlogReply,
  getRepliesForPost,
  updateBlogReply,
  deleteBlogReply,
  toggleBlogReplyLike,
} from '../services/blogService';
import { CustomDropdown } from '../components/CustomDropdown';

export const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<BlogUser[]>([]);
  const [currentUser, setCurrentUser] = useState<BlogUser | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameTag | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postGame, setPostGame] = useState<GameTag>('Genshin Impact');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [replies, setReplies] = useState<Record<string, BlogReply[]>>({});
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [editingReply, setEditingReply] = useState<BlogReply | null>(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [hoveredLikes, setHoveredLikes] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load users from both Genshin and HSR on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const genshinUsers = await getAllUsers();
        const hsrUsers = await getAllHSRUsers();

        // Create a map to track unique users by name
        const uniqueUsers = new Map<string, BlogUser>();

        // Add Genshin users
        genshinUsers.forEach((u: User) => {
          uniqueUsers.set(u.name, {
            id: u.name, // Use name as unique ID to prevent duplicates
            name: u.name,
            game: 'Genshin Impact' as GameTag, // Default game preference
          });
        });

        // Add HSR users (only if they don't already exist)
        hsrUsers.forEach((u: HSRUser) => {
          if (!uniqueUsers.has(u.name)) {
            uniqueUsers.set(u.name, {
              id: u.name, // Use name as unique ID to prevent duplicates
              name: u.name,
              game: 'Honkai: Star Rail' as GameTag, // Default game preference
            });
          }
        });

        const allUsers = Array.from(uniqueUsers.values());
        setUsers(allUsers);

        // Check localStorage for saved user
        const savedUserId = localStorage.getItem('blog-current-user-id');
        if (savedUserId) {
          const savedUser = allUsers.find((u) => u.id === savedUserId);
          if (savedUser) {
            setCurrentUser(savedUser);
          } else if (allUsers.length > 0) {
            setCurrentUser(allUsers[0]);
          }
        } else if (allUsers.length > 0) {
          setCurrentUser(allUsers[0]);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, []);

  // Load blog posts and their replies
  useEffect(() => {
    const loadPosts = async () => {
      try {
        let loadedPosts: BlogPost[];
        if (selectedGame === 'All') {
          loadedPosts = await getAllBlogPosts();
        } else {
          loadedPosts = await getBlogPostsByGame(selectedGame);
        }
        setPosts(loadedPosts);

        // Load replies for all posts
        const allReplies: Record<string, BlogReply[]> = {};
        await Promise.all(
          loadedPosts.map(async (post) => {
            try {
              const postReplies = await getRepliesForPost(post.id);
              allReplies[post.id] = postReplies;
            } catch (error) {
              console.error(`Error loading replies for post ${post.id}:`, error);
              allReplies[post.id] = [];
            }
          })
        );
        setReplies(allReplies);
      } catch (error) {
        console.error('Error loading posts:', error);
      }
      setIsLoading(false);
    };

    loadPosts();
  }, [selectedGame]);

  // Save current user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('blog-current-user-id', currentUser.id);
    }
  }, [currentUser]);

  const handleCreatePost = async () => {
    if (!currentUser || !postTitle.trim() || !postContent.trim()) return;

    const newPost: BlogPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      game: postGame,
      title: postTitle,
      content: postContent,
      timestamp: Date.now(),
      likes: [],
      replyCount: 0,
    };

    try {
      await createBlogPost(newPost);
      setPosts((prev) => [newPost, ...prev]);
      setShowCreatePost(false);
      setPostTitle('');
      setPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !postTitle.trim() || !postContent.trim()) return;

    const updates = {
      title: postTitle,
      content: postContent,
      game: postGame,
    };

    try {
      await updateBlogPost(editingPost.id, updates);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id ? { ...p, ...updates } : p
        )
      );
      setEditingPost(null);
      setPostTitle('');
      setPostContent('');
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post? All replies will also be deleted.')) {
      return;
    }

    try {
      await deleteBlogPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setExpandedPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!currentUser) return;

    try {
      await toggleBlogPostLike(postId, currentUser.id);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const likes = p.likes || [];
            // Check if user already liked (by name or old ID format)
            const hasLiked = likes.includes(currentUser.id) || 
                           likes.some(id => id.includes(currentUser.name));
            
            let newLikes;
            if (hasLiked) {
              // Remove all instances of this user (both old and new formats)
              newLikes = likes.filter(id => 
                id !== currentUser.id && 
                !id.includes(currentUser.name)
              );
            } else {
              // Add the new format ID
              newLikes = [...likes, currentUser.id];
            }
            return { ...p, likes: newLikes };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleExpand = (postId: string) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (prev.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCreateReply = async (postId: string) => {
    if (!currentUser || !replyContent[postId]?.trim()) return;

    const newReply: BlogReply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      postId,
      userId: currentUser.id,
      userName: currentUser.name,
      content: replyContent[postId],
      timestamp: Date.now(),
      likes: [],
    };

    try {
      await createBlogReply(newReply);
      setReplies((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newReply],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p
        )
      );
      setReplyContent((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleUpdateReply = async () => {
    if (!editingReply || !editReplyContent.trim()) return;

    try {
      await updateBlogReply(editingReply.id, { content: editReplyContent });
      setReplies((prev) => ({
        ...prev,
        [editingReply.postId]: prev[editingReply.postId].map((r) =>
          r.id === editingReply.id ? { ...r, content: editReplyContent } : r
        ),
      }));
      setEditingReply(null);
      setEditReplyContent('');
    } catch (error) {
      console.error('Error updating reply:', error);
    }
  };

  const handleDeleteReply = async (reply: BlogReply) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      await deleteBlogReply(reply.id, reply.postId);
      setReplies((prev) => ({
        ...prev,
        [reply.postId]: prev[reply.postId].filter((r) => r.id !== reply.id),
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === reply.postId ? { ...p, replyCount: Math.max(p.replyCount - 1, 0) } : p
        )
      );
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const handleToggleReplyLike = async (reply: BlogReply) => {
    if (!currentUser) return;

    try {
      await toggleBlogReplyLike(reply.id, currentUser.id);
      setReplies((prev) => ({
        ...prev,
        [reply.postId]: prev[reply.postId].map((r) => {
          if (r.id === reply.id) {
            const likes = r.likes || [];
            // Check if user already liked (by name or old ID format)
            const hasLiked = likes.includes(currentUser.id) || 
                           likes.some(id => id.includes(currentUser.name));
            
            let newLikes;
            if (hasLiked) {
              // Remove all instances of this user (both old and new formats)
              newLikes = likes.filter(id => 
                id !== currentUser.id && 
                !id.includes(currentUser.name)
              );
            } else {
              // Add the new format ID
              newLikes = [...likes, currentUser.id];
            }
            return { ...r, likes: newLikes };
          }
          return r;
        }),
      }));
    } catch (error) {
      console.error('Error toggling reply like:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Filter posts based on search query and selected game
  const filteredPosts = posts.filter((post) => {
    // Filter by game first
    const gameMatch = selectedGame === 'All' || post.game === selectedGame;
    
    // Filter by search query
    const searchMatch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return gameMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => navigate('/genshin')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-white transition-all duration-200"
            >
              ← Back
            </button>
            <h1 className="text-4xl md:text-6xl font-bold text-white bg-gradient-to-r from-yellow-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              The Kitchen
            </h1>
          </div>
          <p className="text-lg text-white/80 mb-6">
            Cook up any guides, tips, theorycrafting, or lore discussions you have in your mind!
          </p>

          {/* User Selector */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <label className="text-white/80 font-medium">Posting as:</label>
              <CustomDropdown
                options={users.map(user => ({ value: user.id, label: user.name }))}
                value={currentUser?.id || ''}
                onChange={(value) => {
                  const user = users.find((u) => u.id === value);
                  if (user) setCurrentUser(user);
                }}
                placeholder="Select user..."
                className="min-w-[150px]"
              />
            </div>

            <button
              onClick={() => {
                setShowCreatePost(true);
                setEditingPost(null);
                setPostTitle('');
                setPostContent('');
                setPostGame(currentUser?.game || 'Genshin Impact');
              }}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
            >
              + Create Post
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="w-full px-4 py-3 pl-12 pr-12 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts by title, content, or author..."
                    className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none"
                    style={{
                      color: '#ffffff',
                      fontSize: '16px',
                      border: 'none',
                      outline: 'none'
                    }}
                  />
                </div>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">
                  🔍
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-white/80 transition-colors duration-200 rounded px-2 py-1"
                    style={{
                      backgroundColor: 'rgba(255, 0, 0, 0.1)',
                      color: '#ffffff'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Game Filter */}
          <div className="flex justify-center gap-2">
            {(['All', 'Genshin Impact', 'Honkai: Star Rail'] as const).map((game) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedGame === game
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/20'
                }`}
              >
                {game}
              </button>
            ))}
          </div>
        </div>

        {/* Create/Edit Post Modal */}
        {(showCreatePost || editingPost) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-md rounded-2xl border border-white/20 p-6 w-full max-w-2xl shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">Game</label>
                  <CustomDropdown
                    options={[
                      { value: 'Genshin Impact', label: 'Genshin Impact' },
                      { value: 'Honkai: Star Rail', label: 'Honkai: Star Rail' }
                    ]}
                    value={postGame}
                    onChange={(value) => setPostGame(value as GameTag)}
                    placeholder="Select game..."
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Title</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Enter post title..."
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Content</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share any thoughts, guides, tips, or theories..."
                    rows={8}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowCreatePost(false);
                      setEditingPost(null);
                      setPostTitle('');
                      setPostContent('');
                    }}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 border border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingPost ? handleUpdatePost : handleCreatePost}
                    disabled={!postTitle.trim() || !postContent.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
              <p className="text-white/60 text-lg">
                {posts.length === 0 
                  ? "No posts yet. Be the first to start cooking!"
                  : "No posts match your search criteria. Try adjusting your search or filters."
                }
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">{post.userName}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/60 text-sm">{formatTimestamp(post.timestamp)}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          post.game === 'Genshin Impact'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {post.game}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{post.title}</h3>
                  </div>
                  {currentUser?.id === post.userId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setPostTitle(post.title);
                          setPostContent(post.content);
                          setPostGame(post.game);
                        }}
                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-sm font-medium transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm font-medium transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-white/80 whitespace-pre-wrap mb-4">{post.content}</p>

                {/* Post Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="relative">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      onMouseEnter={() => setHoveredLikes(post.id)}
                      onMouseLeave={() => setHoveredLikes(null)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 ${
                        post.likes?.includes(currentUser?.id || '') || 
                        post.likes?.some(id => id.includes(currentUser?.name || ''))
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      <span>🔥</span>
                      <span>{post.likes?.length || 0}</span>
                    </button>
                    
                    {/* Likes Tooltip */}
                    {hoveredLikes === post.id && post.likes && post.likes.length > 0 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/95 backdrop-blur-md rounded-lg border border-white/20 text-white text-sm shadow-lg z-10 min-w-max">
                        <div className="text-xs text-white/60 mb-1">Liked by:</div>
                        <div className="space-y-1">
                          {post.likes.map((userId) => {
                            const user = users.find(u => u.id === userId);
                            return (
                              <div key={userId} className="text-white/90">
                                {user ? user.name : userId}
                              </div>
                            );
                          })}
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleExpand(post.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white/60 rounded-lg transition-all duration-200"
                  >
                    <span>💬</span>
                    <span>{post.replyCount || 0} {post.replyCount === 1 ? 'Reply' : 'Replies'}</span>
                  </button>
                </div>

                {/* Replies Section */}
                {expandedPosts.has(post.id) && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    {/* Replies List */}
                    <div className="space-y-3 mb-4">
                      {replies[post.id]?.map((reply) => (
                        <div key={reply.id} className="bg-white/5 rounded-lg p-4">
                          {editingReply?.id === reply.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editReplyContent}
                                onChange={(e) => setEditReplyContent(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleUpdateReply}
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-all duration-200"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingReply(null);
                                    setEditReplyContent('');
                                  }}
                                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm font-medium transition-all duration-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-white/90 font-medium text-sm">{reply.userName}</span>
                                  <span className="text-white/40">•</span>
                                  <span className="text-white/50 text-xs">{formatTimestamp(reply.timestamp)}</span>
                                </div>
                                {currentUser?.id === reply.userId && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingReply(reply);
                                        setEditReplyContent(reply.content);
                                      }}
                                      className="text-blue-300 hover:text-blue-200 text-xs transition-all duration-200"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReply(reply)}
                                      className="text-red-300 hover:text-red-200 text-xs transition-all duration-200"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-white/70 text-sm mb-2 whitespace-pre-wrap">{reply.content}</p>
                              <div className="relative">
                                <button
                                  onClick={() => handleToggleReplyLike(reply)}
                                  onMouseEnter={() => setHoveredLikes(reply.id)}
                                  onMouseLeave={() => setHoveredLikes(null)}
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
                                    reply.likes?.includes(currentUser?.id || '') ||
                                    reply.likes?.some(id => id.includes(currentUser?.name || ''))
                                      ? 'bg-red-500/20 text-red-300'
                                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                                  }`}
                                >
                                  <span>🔥</span>
                                  <span>{reply.likes?.length || 0}</span>
                                </button>
                                
                                {/* Reply Likes Tooltip */}
                                {hoveredLikes === reply.id && reply.likes && reply.likes.length > 0 && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/95 backdrop-blur-md rounded-lg border border-white/20 text-white text-sm shadow-lg z-10 min-w-max">
                                    <div className="text-xs text-white/60 mb-1">Liked by:</div>
                                    <div className="space-y-1">
                                      {reply.likes.map((userId) => {
                                        const user = users.find(u => u.id === userId);
                                        return (
                                          <div key={userId} className="text-white/90">
                                            {user ? user.name : userId}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Reply Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyContent[post.id] || ''}
                        onChange={(e) =>
                          setReplyContent((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder="Write a reply..."
                        className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCreateReply(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleCreateReply(post.id)}
                        disabled={!replyContent[post.id]?.trim()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

