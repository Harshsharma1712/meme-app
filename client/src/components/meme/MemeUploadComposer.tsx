import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import UploadZone from './UploadZone';

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
    <Card className="border-white/10 bg-[#171717]/85 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-2">
        <CardTitle className="text-[#E5E5E5]">Post Meme</CardTitle>
        <CardDescription className="text-[#E5E5E5]/60">
          Upload your meme image and add details before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meme-file" className="text-[#E5E5E5]/80">
              Meme image
            </Label>
            <UploadZone id="meme-file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </div>

          {filePreviewUrl && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
              <img src={filePreviewUrl} alt="Meme preview" className="h-64 w-full object-contain" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="meme-caption" className="text-[#E5E5E5]/80">
              Caption
            </Label>
            <Input
              id="meme-caption"
              value={formState.caption}
              onChange={(event) => handleInputChange('caption', event.target.value)}
              required
              placeholder="Write your caption..."
              className="border-white/10 bg-[#0F0F0F] text-[#E5E5E5] placeholder:text-[#E5E5E5]/35"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meme-topic" className="text-[#E5E5E5]/80">
                Topic
              </Label>
              <Input
                id="meme-topic"
                value={formState.topic}
                onChange={(event) => handleInputChange('topic', event.target.value)}
                required
                placeholder="Humor, office, coding..."
                className="border-white/10 bg-[#0F0F0F] text-[#E5E5E5] placeholder:text-[#E5E5E5]/35"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meme-style" className="text-[#E5E5E5]/80">
                Style
              </Label>
              <Input
                id="meme-style"
                value={formState.style}
                onChange={(event) => handleInputChange('style', event.target.value)}
                required
                placeholder="Dark, witty, sarcastic..."
                className="border-white/10 bg-[#0F0F0F] text-[#E5E5E5] placeholder:text-[#E5E5E5]/35"
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
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="text-[#E5E5E5]/75 hover:bg-white/10 hover:text-[#E5E5E5]"
                disabled={posting}
              >
                Cancel
              </Button>
            )}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                type="submit"
                disabled={posting}
                className="bg-[#3B82F6] text-white hover:bg-[#2563EB]"
              >
                {posting ? 'Posting...' : 'Post Meme'}
              </Button>
            </motion.div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
