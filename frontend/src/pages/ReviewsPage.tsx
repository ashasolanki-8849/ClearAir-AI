import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { apiClient } from '../services/api';

interface ReviewItem {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  location?: string;
  createdAt: string;
}

export const ReviewsPage = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ success: boolean; reviews: ReviewItem[] }>('/reviews');
      if (res.success && res.reviews) {
        setReviews(res.reviews);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setErrorMsg('Please enter both your name and review comment.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await apiClient<{ success: boolean; message: string; review: ReviewItem }>('/reviews', {
        method: 'POST',
        body: JSON.stringify({ name, rating, comment, location }),
      });

      if (res.success && res.review) {
        setSuccessMsg('Thank you! Your review has been submitted successfully.');
        setName('');
        setComment('');
        setLocation('');
        setRating(5);
        setReviews((prev) => [res.review, ...prev]);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            User Reviews
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Read authentic feedback from families and citizens using ClearAir.
          </p>
        </div>

        {/* Submit Review Card */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-sky-500" />
            <span>Share Your Experience</span>
          </h2>

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl border border-sky-500/20 bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Your City / Area (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Rohini, Delhi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-zinc-300 hover:text-amber-400 focus:outline-none transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-semibold text-zinc-700 dark:text-zinc-300">
                  {rating} out of 5 stars
                </span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Your Review *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How has ClearAir helped you or your family navigate winter smog?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Recent Reviews ({reviews.length})
          </h2>

          {loading ? (
            <div className="text-center py-10 text-xs text-zinc-400">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-zinc-900 dark:text-white">{rev.name}</p>
                      {rev.location && (
                        <p className="text-[11px] text-zinc-400">{rev.location}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-200 dark:text-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {rev.comment}
                  </p>

                  <span className="text-[10px] text-zinc-400 block pt-1">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
