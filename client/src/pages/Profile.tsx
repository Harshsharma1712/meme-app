import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Label } from '../components/ui/label';
import MemeUploadComposer from '../components/meme/MemeUploadComposer';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showComposer, setShowComposer] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('user-avatar', file); // Matches the postman collection

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Avatar uploaded successfully!');

      // Update the user details 
      if (response.data.user) {
        updateUser(response.data.user);
      } else if (response.data.avatarUrl) {
        updateUser({ ...user!, avatarUrl: response.data.avatarUrl });
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-10 text-zinc-400">Please log in to view your profile.</div>;
  }

  // Use baseUrl from API for relative avatar URLs if necessary
  const getAvatarSrc = () => {
    console.log(user)
    if (!user.avatarUrl) return '';
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Fallback: If URL doesn't include /api, we strip /api from the baseUrl
    const host = baseUrl.replace('/api', '');
    return `${host}${user.avatarUrl}`;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4">
      <Card className="bg-zinc-950 border-zinc-800 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-2 border-violet-500 shadow-xl shadow-violet-500/20">
                <AvatarImage src={getAvatarSrc()} alt={user.username} className="object-cover" />
                <AvatarFallback className="bg-zinc-800 text-2xl font-bold text-violet-400">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">
                  {user.username}
                </CardTitle>
                <CardDescription className="text-zinc-400 mt-1">
                  {user.email}
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setShowComposer(true)}
              className="bg-linear-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
            >
              Post Meme
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Update Avatar</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar-upload" className="text-zinc-300">Choose Image</Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-zinc-900 border-zinc-800 text-zinc-300 file:bg-zinc-800 file:text-zinc-100 file:border-0 file:mr-4 file:py-1.5 file:px-3 file:rounded-md hover:file:bg-zinc-700 transition-all cursor-pointer"
                />
              </div>
              <Button
                type="submit"
                disabled={!file || loading}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-300"
              >
                {loading ? 'Uploading...' : 'Upload Avatar'}
              </Button>
              {message && (
                <div className={`p-3 text-sm font-medium rounded-md border ${message.includes('success') ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900/50' : 'text-red-400 bg-red-950/50 border-red-900/50'}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </CardContent>
      </Card>

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center">
          <div className="w-full max-w-2xl">
            <MemeUploadComposer
              onCancel={() => setShowComposer(false)}
              onCreated={() => {
                setShowComposer(false);
                navigate('/feed');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
