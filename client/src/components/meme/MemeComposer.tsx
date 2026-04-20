import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface MemeTemplate {
  id: string;
  name: string;
  tags: string[];
  media_url: string;
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

interface MemeComposerProps {
  onCreated?: () => Promise<void> | void;
}

export default function MemeComposer({ onCreated }: MemeComposerProps) {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [formData, setFormData] = useState<MemeFormState>(initialFormState);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === formData.template_id),
    [formData.template_id, templates]
  );

  useEffect(() => {
    const loadTemplates = async () => {
      setLoadingTemplates(true);
      setError('');
      try {
        const response = await api.get('/memes/templates');
        const fetchedTemplates = response.data?.data || [];
        setTemplates(Array.isArray(fetchedTemplates) ? fetchedTemplates : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load templates.');
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, []);

  const handleInputChange = (field: keyof MemeFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateMeme = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPosting(true);
    setError('');
    setPostMessage('');

    try {
      await api.post('/memes/post', formData);
      setPostMessage('Meme posted successfully.');
      setFormData(initialFormState);
      await onCreated?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to post meme.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">Create Meme</CardTitle>
        <CardDescription className="text-zinc-400">
          Pick a template and craft your next post.
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
              disabled={loadingTemplates}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60"
            >
              <option value="">{loadingTemplates ? 'Loading templates...' : 'Select a template'}</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-black">
              <img
                src={selectedTemplate.media_url}
                alt={selectedTemplate.name}
                className="h-64 w-full object-contain"
              />
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
  );
}
