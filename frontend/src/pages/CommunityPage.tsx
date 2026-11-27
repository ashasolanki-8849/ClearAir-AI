import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAQI } from '../context/AQIContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/api';
import {
  Users,
  MapPin,
  MessageSquare,
  Send,
  Flag,
  ThumbsUp,
  AlertTriangle,
  Sparkles,
  Calendar,
  CheckCircle2,
  Info,
  Shield,
} from 'lucide-react';

interface CommunityPostItem {
  _id: string;
  authorName: string;
  authorRole: string;
  city?: string;
  areaName?: string;
  category: string;
  title: string;
  content: string;
  likesCount?: number;
  likedBy?: string[];
  createdAt: string;
}

const DEFAULT_COMMUNITY_POSTS: CommunityPostItem[] = [
  {
    _id: 'post-1',
    authorName: 'Ramesh Patel',
    authorRole: 'Local Resident',
    city: 'Gandhinagar',
    areaName: 'Sector 21',
    category: 'air_quality',
    title: '🚨 Morning smog alert for commuters & school children',
    content: 'Dense haze observed along the main highway and junction between 7:00 AM and 8:30 AM. Advising pedestrians and two-wheeler commuters to wear a fitted N95 mask.',
    likesCount: 18,
    likedBy: [],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    _id: 'post-2',
    authorName: 'Dr. Ananya Sharma',
    authorRole: 'Community Physician',
    city: 'Gandhinagar',
    areaName: 'Infocity',
    category: 'health_tips',
    title: '💡 Best hours for morning walks and outdoor exercise',
    content: 'Winter temperature inversion keeps exhaust particles trapped close to ground level at dawn. Please postpone morning jogs until 9:30 AM when sunlight helps disperse the smog.',
    likesCount: 29,
    likedBy: [],
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    _id: 'post-3',
    authorName: 'Sanjay Mehta',
    authorRole: 'Resident Welfare Society',
    city: 'Gandhinagar',
    areaName: 'Sector 7',
    category: 'initiatives',
    title: '🧹 Zero-Burn Leaf Composting & Clean Air Drive this Sunday',
    content: 'Do not burn dry leaves or yard waste. Join our clean air committee behind the community garden this Sunday at 8:30 AM to turn leaves into organic compost pits.',
    likesCount: 42,
    likedBy: [],
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },
];

export const CommunityPage: React.FC = () => {
  const { location, aqiData } = useAQI();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('air_quality');
  const [submitting, setSubmitting] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (activeCategory !== 'all') {
        queryParams.append('category', activeCategory);
      }
      if (location.city) {
        queryParams.append('city', location.city);
      }

      const res = await apiClient<{ success: boolean; posts: CommunityPostItem[] }>(
        `/communities/feed/posts?${queryParams.toString()}`
      );
      if (res && res.success && res.posts && res.posts.length > 0) {
        setPosts(res.posts);
      } else {
        setPosts(DEFAULT_COMMUNITY_POSTS);
      }
    } catch (err: any) {
      console.warn('Could not fetch community posts, using default community feed:', err.message);
      setPosts(DEFAULT_COMMUNITY_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, location.city]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (!isAuthenticated) {
      showToast('Please sign in to share a community post.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient<{ success: boolean; post: CommunityPostItem }>('/communities/feed/posts', {
        method: 'POST',
        bodyData: {
          title: title.trim(),
          content: content.trim(),
          category,
          city: location.city || location.name,
          areaName: location.name,
        },
      });

      if (res.success && res.post) {
        showToast('Your community post has been shared!', 'success');
        setPosts((prev) => [res.post, ...prev]);
        setTitle('');
        setContent('');
        setShowPostForm(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Could not share post.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportPost = async (postId: string) => {
    if (!window.confirm('Do you want to report this post as inappropriate?')) return;

    try {
      await apiClient(`/communities/posts/${postId}/flag`, {
        method: 'POST',
        bodyData: { reason: 'Reported by community user for inappropriate content.' },
      });
      showToast('Thank you. The post has been flagged for moderation.', 'info');
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err: any) {
      showToast('Could not report post. Please try again.', 'error');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated) {
      showToast('Please sign in to like community posts.', 'info');
      return;
    }

    try {
      const res = await apiClient<{ success: boolean; likesCount: number; isLiked: boolean }>(
        `/communities/posts/${postId}/like`,
        { method: 'POST' }
      );
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, likesCount: res.likesCount } : p))
        );
      }
    } catch (err) {
      // Ignore
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'air_quality':
        return 'Pollution Update';
      case 'sustainable_living':
        return 'Safe Daily Practice';
      case 'activities':
        return 'Community Activity';
      case 'pollution_concerns':
        return 'Area Notice';
      default:
        return 'Community Tip';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <Users className="w-7 h-7 text-sky-500" />
              <span>Community Hub</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              <span>Connecting neighbors near {location.name} to understand pollution and stay safe together.</span>
            </p>
          </div>

          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{showPostForm ? 'Close Form' : 'Share a Tip / Update'}</span>
          </button>
        </div>

        {/* Share Form */}
        {showPostForm && (
          <form
            onSubmit={handleCreatePost}
            className="p-5 rounded-3xl border border-sky-500/30 bg-white dark:bg-black shadow-sm space-y-4 text-xs animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                Share a Simple Tip or Pollution Update
              </h3>
              <span className="text-zinc-400 text-[11px]">Area: {location.name}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="air_quality">Pollution Update (What you see in your area)</option>
                  <option value="sustainable_living">Safe Daily Practice (Tips for home or travel)</option>
                  <option value="activities">Community Awareness Activity</option>
                  <option value="general">General Community Advice</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Heavy morning smog near Sector 21 today"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Your Advice or Update
                </label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share a short, helpful sentence for neighbors (e.g. Avoid the outer bypass road between 8 AM and 9 AM due to heavy diesel traffic)."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPostForm(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Sharing...' : 'Share Post'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'all', label: 'All Community Posts' },
            { id: 'air_quality', label: 'Pollution Updates' },
            { id: 'sustainable_living', label: 'Safe Daily Practices' },
            { id: 'activities', label: 'Community Activities' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl border font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-400">Loading community updates...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/30 text-sky-500 mx-auto flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                No community posts yet in this category for {location.name}.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Be the first neighbor to share a helpful tip or air safety observation!
              </p>
              <button
                onClick={() => setShowPostForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white font-semibold text-xs mt-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Share a Tip</span>
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      {post.authorName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 capitalize">
                      {post.authorRole || 'Neighbor'}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-500" />
                      <span>{post.city || post.areaName || location.name}</span>
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40">
                    {getCategoryLabel(post.category)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900 text-zinc-500 dark:text-zinc-400 text-[11px]">
                  <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(post._id)}
                      className="flex items-center gap-1 hover:text-sky-500 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful ({post.likesCount || 0})</span>
                    </button>

                    <button
                      onClick={() => handleReportPost(post._id)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                      title="Report inappropriate post"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};