import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface MemeUploadComposerProps {
  onCreated?: () => Promise<void> | void;
  onCancel?: () => void;
}

const initialState = {
  caption: '',
  topic: '',
  style: '',
  explanation: '',
};

export default function MemeUploadComposer({ onCreated, onCancel }: MemeUploadComposerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [formState, setFormState] = useState(initialState);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filePreviewUrl = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleInputChange = (field: keyof typeof initialState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Please choose an image to upload.');
      return;
    }

    setPosting(true);
    setError('');
    setSuccessMessage('');

    const payload = new FormData();
    payload.append('meme', file);
    payload.append('caption', formState.caption.trim());
    payload.append('topic', formState.topic.trim());
    payload.append('style', formState.style.trim());
    if (formState.explanation.trim()) {
      payload.append('explanation', formState.explanation.trim());
    }

    try {
      await api.post('/memes/upload', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMessage('Meme posted successfully.');
      setFile(null);
      setFormState(initialState);
      await onCreated?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to upload meme.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950 shadow-2xl">
      <CardHeader className="space-y-2">
        <CardTitle className="text-zinc-100">Post Meme</CardTitle>
        <CardDescription className="text-zinc-400">
          Upload your meme image and add details before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meme-file" className="text-zinc-300">
              Meme image
            </Label>
            <Input
              id="meme-file"
              type="file"
              accept="image/*"
              required
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="cursor-pointer border-zinc-800 bg-zinc-900 text-zinc-200 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-zinc-100 hover:file:bg-zinc-700"
            />
          </div>

          {filePreviewUrl && (
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-black">
              <img src={filePreviewUrl} alt="Meme preview" className="h-64 w-full object-contain" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="meme-caption" className="text-zinc-300">
              Caption
            </Label>
            <Input
              id="meme-caption"
              value={formState.caption}
              onChange={(event) => handleInputChange('caption', event.target.value)}
              required
              placeholder="Write your caption..."
              className="border-zinc-800 bg-zinc-900 text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meme-topic" className="text-zinc-300">
                Topic
              </Label>
              <Input
                id="meme-topic"
                value={formState.topic}
                onChange={(event) => handleInputChange('topic', event.target.value)}
                required
                placeholder="Humor, office, coding..."
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meme-style" className="text-zinc-300">
                Style
              </Label>
              <Input
                id="meme-style"
                value={formState.style}
                onChange={(event) => handleInputChange('style', event.target.value)}
                required
                placeholder="Dark, witty, sarcastic..."
                className="border-zinc-800 bg-zinc-900 text-zinc-100"
              />
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="meme-explanation" className="text-zinc-300">
              Explanation (optional)
            </Label>
            <textarea
              id="meme-explanation"
              value={formState.explanation}
              onChange={(event) => handleInputChange('explanation', event.target.value)}
              rows={3}
              placeholder="Add extra context for your meme..."
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none ring-offset-zinc-950 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-violet-500"
            />
          </div> */}

          {successMessage && (
            <div className="rounded-md border border-emerald-900/60 bg-emerald-950/40 p-3 text-sm text-emerald-300">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                disabled={posting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={posting}
              className="bg-linear-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
            >
              {posting ? 'Posting...' : 'Post Meme'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
