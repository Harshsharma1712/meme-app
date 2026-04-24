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
    <Card className="border-white/10 bg-[#171717]/80 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-[#E5E5E5]">Create Meme</CardTitle>
        <CardDescription className="text-[#E5E5E5]/60">
          Pick a template and craft your next post.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateMeme} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-select" className="text-[#E5E5E5]/80">
              Template
            </Label>
            <select
              id="template-select"
              value={formData.template_id}
              onChange={(event) => handleInputChange('template_id', event.target.value)}
              required
              disabled={loadingTemplates}
              className="w-full rounded-md border border-white/10 bg-[#0F0F0F] px-3 py-2 text-sm text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] disabled:opacity-60"
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
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
              <img
                src={selectedTemplate.media_url}
                alt={selectedTemplate.name}
                className="h-64 w-full object-contain"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-[#E5E5E5]/80">
                Topic
              </Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(event) => handleInputChange('topic', event.target.value)}
                placeholder="Relationship, office, tech..."
                required
                className="border-white/10 bg-[#0F0F0F] text-[#E5E5E5]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="style" className="text-[#E5E5E5]/80">
                Style
              </Label>
              <Input
                id="style"
                value={formData.style}
                onChange={(event) => handleInputChange('style', event.target.value)}
                placeholder="Humor, sarcasm, satire..."
                required
                className="border-white/10 bg-[#0F0F0F] text-[#E5E5E5]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption" className="text-[#E5E5E5]/80">
              Caption
            </Label>
            <Input
              id="caption"
              value={formData.caption}
              onChange={(event) => handleInputChange('caption', event.target.value)}
              placeholder="Write your caption..."
              required
              className="border-white/10 bg-[#0F0F0F] text-[#E5E5E5]"
            />
          </div>

          {postMessage && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {postMessage}
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={posting || !formData.template_id}
            className="w-full bg-[#3B82F6] text-white hover:bg-[#2563EB]"
          >
            {posting ? 'Posting...' : 'Post Meme'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
