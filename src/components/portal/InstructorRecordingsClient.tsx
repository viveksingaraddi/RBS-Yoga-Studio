'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Film,
  PlusCircle,
  Play,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  Upload,
  X,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

interface RecordingItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  instructor: string;
  durationSeconds: number;
  thumbnailUrl: string;
  streamVideoId: string;
  isPublished: boolean;
  planId?: string | null;
  createdAt: string;
  watchCount: number;
}

interface PlanOption {
  id: string;
  name: string;
}

export default function InstructorRecordingsClient({
  initialRecordings,
  plans,
}: {
  initialRecordings: RecordingItem[];
  plans: PlanOption[];
}) {
  const router = useRouter();
  const [recordings, setRecordings] = useState<RecordingItem[]>(initialRecordings);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingRecording, setEditingRecording] = useState<RecordingItem | null>(null);

  // Upload Form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'Asana Practice',
    durationMinutes: '30',
    planId: '',
    streamVideoId: '',
    thumbnailUrl: '/images/hero-bg.jpg',
    isPublished: true,
  });

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['ALL', 'Asana Practice', 'Hatha Yoga', 'Pranayama', 'Meditation', 'Vinyasa Flow'];

  const filteredRecordings = recordings.filter((r) => {
    if (categoryFilter === 'ALL') return true;
    return r.category === categoryFilter;
  });

  // Handle direct file upload to Cloudflare Stream
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);
    setUploadProgress(10);

    try {
      // 1. Request direct upload URL from server
      const urlRes = await fetch('/api/instructor/videos/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          maxDurationSeconds: parseInt(uploadForm.durationMinutes, 10) * 60,
        }),
      });

      const urlData = await urlRes.json();
      if (!urlRes.ok || !urlData.uploadUrl) {
        throw new Error(urlData.error || 'Failed to initialize direct upload.');
      }

      setUploadProgress(40);
      let streamVideoId = urlData.uid;

      // 2. If a physical file was selected, upload directly to Cloudflare
      if (uploadFile) {
        setUploadProgress(60);
        const formData = new FormData();
        formData.append('file', uploadFile);

        const cfUploadRes = await fetch(urlData.uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!cfUploadRes.ok) {
          console.warn('Cloudflare direct upload returned non-200, continuing with UID');
        }
      }

      setUploadProgress(85);

      // 3. Save recording metadata in PostgreSQL
      const saveRes = await fetch('/api/instructor/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          durationSeconds: parseInt(uploadForm.durationMinutes, 10) * 60,
          streamVideoId,
          thumbnailUrl: uploadForm.thumbnailUrl,
          isPublished: uploadForm.isPublished,
          planId: uploadForm.planId || null,
        }),
      });

      const saveData = await saveRes.json();
      if (saveRes.ok) {
        setActionMessage({
          text: `Masterclass "${uploadForm.title}" successfully added to the digital sadhana library!`,
          type: 'success',
        });
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setUploadProgress(null);
        setUploadForm({
          title: '',
          description: '',
          category: 'Asana Practice',
          durationMinutes: '30',
          planId: '',
          streamVideoId: '',
          thumbnailUrl: '/images/hero-bg.jpg',
          isPublished: true,
        });
        router.refresh();
      } else {
        throw new Error(saveData.error || 'Failed to save video metadata.');
      }
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Video upload failed.', type: 'error' });
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/instructor/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      if (res.ok) {
        setRecordings((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isPublished: !currentStatus } : r))
        );
        setActionMessage({
          text: `Video ${!currentStatus ? 'published for learners' : 'unpublished'}.`,
          type: 'success',
        });
      }
    } catch {
      setActionMessage({ text: 'Failed to update publication status.', type: 'error' });
    }
  };

  const handleDeleteRecording = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}" from Cloudflare Stream and your studio archives?`)) return;

    try {
      const res = await fetch(`/api/instructor/videos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRecordings((prev) => prev.filter((r) => r.id !== id));
        setActionMessage({ text: 'Recording permanently deleted.', type: 'success' });
      } else {
        setActionMessage({ text: 'Failed to delete video.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error deleting video.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-bold">
              Digital Sadhana Vault
            </span>
            <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
              Cloudflare Stream
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest mt-1">
            Recorded Library Management
          </h1>
          <p className="text-xs text-charcoal/75 max-w-xl">
            Upload guided masterclasses directly to Cloudflare Stream, organize practices by asana category, and control student membership pass access.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-forest text-ivory px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all shadow-sm shrink-0"
        >
          <Upload className="w-4 h-4 text-earth" />
          <span>Upload Masterclass</span>
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 border flex items-center justify-between text-xs transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-charcoal/60 hover:text-charcoal p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold border transition-all ${
              categoryFilter === cat
                ? 'bg-forest text-ivory border-forest shadow-sm'
                : 'bg-ivory text-charcoal/70 border-sage-dark/40 hover:border-forest'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="space-y-4">
        {filteredRecordings.length === 0 ? (
          <div className="bg-ivory border border-sage-dark/40 p-12 text-center space-y-2">
            <Film className="w-8 h-8 text-olive mx-auto opacity-50" />
            <h3 className="font-serif text-lg text-forest">No masterclasses in this category</h3>
            <p className="text-xs text-charcoal/60">Upload your first guided video to build the studio archives.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecordings.map((rec) => {
              const minutes = Math.round(rec.durationSeconds / 60);

              return (
                <div
                  key={rec.id}
                  className={`bg-ivory border shadow-sm flex flex-col justify-between overflow-hidden transition-all ${
                    rec.isPublished ? 'border-sage-dark/50 hover:shadow-card' : 'border-dashed border-charcoal/30 opacity-70'
                  }`}
                >
                  <div>
                    {/* Thumbnail banner */}
                    <div className="relative h-44 bg-forest/20 overflow-hidden group">
                      <img
                        src={rec.thumbnailUrl || '/images/hero-bg.jpg'}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
                          {rec.category}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleTogglePublish(rec.id, rec.isPublished)}
                          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold shadow-xs ${
                            rec.isPublished ? 'bg-emerald-600 text-ivory' : 'bg-charcoal text-ivory'
                          }`}
                        >
                          {rec.isPublished ? 'Published' : 'Draft / Private'}
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-ivory text-xs">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-earth" />
                          <span>{minutes} Mins</span>
                        </span>
                        <span className="text-[11px] text-ivory/80">
                          {rec.watchCount} practitioners studied
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-serif text-lg text-forest font-medium line-clamp-1">{rec.title}</h3>
                      <p className="text-xs text-charcoal/70 line-clamp-2">{rec.description || 'Guided yoga masterclass'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 border-t border-sage-dark/20 mt-3 flex items-center justify-between text-xs">
                    <Link
                      href={`/portal/recordings/${rec.slug}`}
                      className="inline-flex items-center space-x-1 uppercase tracking-wider font-bold text-forest hover:text-earth text-[11px] underline"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Preview Class</span>
                    </Link>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteRecording(rec.id, rec.title)}
                        className="p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete recording"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Masterclass Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-sage-dark/40 pb-4 mb-4">
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold">
                Direct Cloudflare Stream Transmitter
              </span>
              <h2 className="font-serif text-2xl text-forest">Upload Recorded Masterclass</h2>
              <p className="text-xs text-charcoal/70 mt-1">
                Uploads securely to Cloudflare Stream CDN. Students will stream with encrypted signed URLs.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Masterclass Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g. Asana Core Alignment &amp; Hip Opening"
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest text-xs"
                  >
                    <option value="Asana Practice">Asana Practice</option>
                    <option value="Hatha Yoga">Hatha Yoga</option>
                    <option value="Pranayama">Pranayama</option>
                    <option value="Meditation">Meditation</option>
                    <option value="Vinyasa Flow">Vinyasa Flow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={uploadForm.durationMinutes}
                    onChange={(e) => setUploadForm({ ...uploadForm, durationMinutes: e.target.value })}
                    className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Detailed Lesson Description
                </label>
                <textarea
                  rows={2}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Describe postures covered, contraindications, and therapeutic benefits..."
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                />
              </div>

              {/* Video File Input */}
              <div className="p-4 border border-dashed border-sage-dark/50 bg-sage-light/30 text-center space-y-2">
                <Upload className="w-6 h-6 text-earth mx-auto" />
                <label className="block text-xs text-forest font-semibold cursor-pointer hover:underline">
                  <span>{uploadFile ? uploadFile.name : 'Choose Video File (MP4, MOV)'}</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-olive">
                  Direct Creator Upload to Cloudflare Stream CDN. Max 2 hours / 5GB.
                </p>
              </div>

              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-olive font-semibold">
                    <span>Uploading to Cloudflare Stream...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-sage-light h-2 overflow-hidden">
                    <div style={{ width: `${uploadProgress}%` }} className="bg-forest h-full transition-all duration-300" />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="pubCheck"
                  checked={uploadForm.isPublished}
                  onChange={(e) => setUploadForm({ ...uploadForm, isPublished: e.target.checked })}
                  className="w-4 h-4 text-forest"
                />
                <label htmlFor="pubCheck" className="text-xs text-forest font-semibold cursor-pointer">
                  Publish immediately in Student Sanctuary Library
                </label>
              </div>

              <div className="pt-3 border-t border-sage-dark/30 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 uppercase tracking-wider font-semibold text-charcoal/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 uppercase tracking-wider font-semibold bg-forest text-ivory hover:bg-forest-light"
                >
                  {submitting ? 'Transmitting...' : 'Upload & Publish Masterclass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
