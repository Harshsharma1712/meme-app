import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface MemeTemplate {
  id: string;
  name: string;
  tags: string[];
  media_url: string;
}

interface MemePost {
  id: string;
  caption: string;
  topic: string;
  style: string;
  created_at: string;
  username: string;
  media_url: string;
  avatar_url: string;
  likes_count: string | number;
  comments_count: string | number;
}

interface MemeFormState {
  template_id: string;
  caption: string;
  topic: string;
  style: string;
}

const initialFormState: MemeFormState = {
  template_id: '',
  caption: '',
  topic: '',
  style: '',
};

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function Feed() {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [memes, setMemes] = useState<MemePost[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [formData, setFormData] = useState<MemeFormState>(initialFormState);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === formData.template_id),
    [formData.template_id, templates]
  );

  const loadTemplates = async () => {
    const response = await api.get('/memes/templates');
    const fetchedTemplates = response.data?.data || [];
    setTemplates(Array.isArray(fetchedTemplates) ? fetchedTemplates : []);
  };

  const loadMemes = async () => {
    const response = await api.get('/memes/get');
    const fetchedMemes = response.data?.data || [];
    setMemes(Array.isArray(fetchedMemes) ? fetchedMemes : []);
  };

  useEffect(() => {
    const loadFeed = async () => {
      setLoadingFeed(true);
      setError('');
      try {
        await Promise.all([loadTemplates(), loadMemes()]);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load meme feed.');
      } finally {
        setLoadingFeed(false);
      }
    };

    loadFeed();
  }, []);

  const handleInputChange = (field: keyof MemeFormState, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleCreateMeme = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPosting(true);
    setPostMessage('');
    setError('');

    try {
      await api.post('/memes/post', formData);
      setPostMessage('Meme posted successfully.');
      setFormData(initialFormState);
      await loadMemes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to post meme.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Create Meme</CardTitle>
          <CardDescription className="text-zinc-400">
            Pick a template and share your next banger with the feed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateMeme} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-select" className="text-zinc-300">
                Template
              </Label>
              <select
                id="template-select"
                value={formData.template_id}
                onChange={(event) => handleInputChange('template_id', event.target.value)}
                required
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div className="overflow-hidden rounded-lg border border-zinc-800">
                <img src={selectedTemplate.media_url} alt={selectedTemplate.name} className="h-44 w-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-zinc-300">
                  Topic
                </Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(event) => handleInputChange('topic', event.target.value)}
                  placeholder="Relationship, office, tech..."
                  required
                  className="bg-zinc-900 border-zinc-800 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style" className="text-zinc-300">
                  Style
                </Label>
                <Input
                  id="style"
                  value={formData.style}
                  onChange={(event) => handleInputChange('style', event.target.value)}
                  placeholder="Humor, sarcasm, satire..."
                  required
                  className="bg-zinc-900 border-zinc-800 text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption" className="text-zinc-300">
                Caption
              </Label>
              <Input
                id="caption"
                value={formData.caption}
                onChange={(event) => handleInputChange('caption', event.target.value)}
                placeholder="Write your caption..."
                required
                className="bg-zinc-900 border-zinc-800 text-zinc-100"
              />
            </div>

            {postMessage && (
              <div className="rounded-md border border-emerald-900/50 bg-emerald-950/40 p-3 text-sm text-emerald-300">
                {postMessage}
              </div>
            )}
            {error && (
              <div className="rounded-md border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={posting || !formData.template_id}
              className="w-full bg-linear-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
            >
              {posting ? 'Posting...' : 'Post Meme'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-100">Meme Feed</h2>
          <Button
            type="button"
            variant="ghost"
            className="text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
            onClick={loadMemes}
            disabled={loadingFeed}
          >
            Refresh
          </Button>
        </div>

        {loadingFeed ? (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="py-8 text-center text-zinc-400">Loading memes...</CardContent>
          </Card>
        ) : memes.length === 0 ? (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="py-8 text-center text-zinc-400">No memes yet. Be the first to post.</CardContent>
          </Card>
        ) : (
          memes.map((meme) => (
            <Card key={meme.id} className="bg-zinc-950 border-zinc-800 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-zinc-700">
                      <AvatarImage src={meme.avatar_url} alt={meme.username} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-200">
                        {meme.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base text-zinc-100">{meme.username}</CardTitle>
                      <CardDescription className="text-xs text-zinc-400">
                        {formatRelativeTime(meme.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400">
                    #{meme.topic} • {meme.style}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <img src={meme.media_url} alt={meme.caption} className="w-full max-h-100 sm:max-h-125 md:max-h-150 object-contain bg-black rounded-lg border border-zinc-800" />
                <p className="text-zinc-200">{meme.caption}</p>
                <div className="text-sm text-zinc-400">
                  {meme.likes_count} likes • {meme.comments_count} comments
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
