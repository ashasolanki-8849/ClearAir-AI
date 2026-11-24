import React, { useState } from 'react';
import { CommunityPostData, CommunityCommentData, PostCategory } from '../../types';
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  Send,
  Flag,
  Pin,
  Clock,
  User,
  Filter,
} from 'lucide-react';

interface CommunityDiscussionBoardProps {
  posts: CommunityPostData[];
  onSelectPost: (postId: string) => Promise<CommunityCommentData[]>;
  onCreatePost: (data: { category: PostCategory; title: string; content: string }) => Promise<void>;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onToggleLike: (postId: string) => Promise<void>;
  onFlagPost: (postId: string, reason: string) => Promise<void>;
}

export const CommunityDiscussionBoard: React.FC<CommunityDiscussionBoardProps> = ({
  posts,
  onSelectPost,
  onCreatePost,
  onAddComment,
  onToggleLike,
  onFlagPost,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostCategory, setNewPostCategory] = useState<PostCategory>('general');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Active expanded comments
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommunityCommentData[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const filteredPosts =
    categoryFilter === 'all'
      ? posts
      : posts.filter((p) => p.category === categoryFilter);

  const handleOpenComments = async (postId: string) => {
    if (activePostId === postId) {
      setActivePostId(null);
      return;
    }
    setActivePostId(postId);
    setIsLoadingComments(true);
    try {
      const comms = await onSelectPost(postId);
      setComments(comms);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSendComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    await onAddComment(postId, commentInput.trim());
    setCommentInput('');
    const comms = await onSelectPost(postId);
    setComments(comms);
  };

  const handleCreateNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    try {
      setIsSubmittingPost(true);
      await onCreatePost({
        category: newPostCategory,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
      });
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreateModal(false);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Community Discussion & Local Advice Forum
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {posts.length} Posts
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Exchange tips on air purifiers, RWA resolutions, school transport, and smog safety
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none pr-2 py-1"
            >
              <option value="all">All Topics</option>
              <option value="air_quality">Air Quality & Readings</option>
              <option value="pollution_concerns">Local Smog Concerns</option>
              <option value="sustainable_living">Green Solutions</option>
              <option value="waste_management">Waste & Anti-Burning</option>
              <option value="activities">Drives & Activities</option>
              <option value="education">School & Health Advice</option>
            </select>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start Thread</span>
          </button>
        </div>
      </div>

      {/* New Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Start a New Discussion Thread
              </h4>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewPost} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Category
                </label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as PostCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="air_quality">Air Quality & Readings</option>
                  <option value="pollution_concerns">Local Smog Concerns</option>
                  <option value="sustainable_living">Green Living</option>
                  <option value="waste_management">Waste & Anti-Burning</option>
                  <option value="activities">Community Drives</option>
                  <option value="education">School & Health Advice</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Thread Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Which air purifier filter lasts best in high winter dust?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience, inquiry, or suggestion..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
                >
                  {isSubmittingPost ? 'Posting...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <MessageSquare className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            No discussion threads yet
          </h4>
          <p className="text-xs text-zinc-500 mt-1">
            Start a conversation with your neighbours or community colleagues!
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className={`p-5 rounded-2xl border transition-all ${
                post.pinned
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
              } space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {post.pinned && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                      <Pin className="w-3 h-3" /> PINNED
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    {post.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    By <b>{post.authorName}</b> ({post.authorRole})
                  </span>
                </div>

                <span className="text-[11px] text-zinc-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {post.title}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Action Buttons: Like, Comment Drawer, Flag */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleLike(post._id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => handleOpenComments(post._id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.commentsCount} Comments</span>
                  </button>
                </div>

                <button
                  onClick={() => onFlagPost(post._id, 'Inappropriate content')}
                  className="text-zinc-400 hover:text-rose-500 p-1"
                  title="Flag for moderation"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Comments Accordion */}
              {activePostId === post._id && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h5 className="font-bold text-xs text-zinc-700 dark:text-zinc-300">
                    Discussion Replies ({comments.length})
                  </h5>

                  {isLoadingComments ? (
                    <div className="text-xs text-zinc-400 py-2">Loading replies...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-xs text-zinc-400 italic">
                      No replies yet. Be the first to chime in!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {comments.map((c) => (
                        <div
                          key={c._id}
                          className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {c.authorName} ({c.authorRole})
                            </span>
                            <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-300">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Write a helpful reply..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendComment(post._id);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleSendComment(post._id)}
                      className="p-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
