import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    return <div className="mt-10 text-center text-[#E5E5E5]/60">Please log in to view your profile.</div>;
  }

  // Use baseUrl from API for relative avatar URLs if necessary
  const getAvatarSrc = () => {
    if (!user.avatarUrl) return '';
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Fallback: If URL doesn't include /api, we strip /api from the baseUrl
    const host = baseUrl.replace('/api', '');
    return `${host}${user.avatarUrl}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-5xl space-y-6 px-4"
    >
      <Card className="border-white/10 bg-[#171717]/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-[#3B82F6]/70 shadow-xl shadow-[#3B82F6]/20">
                <AvatarImage src={getAvatarSrc()} alt={user.username} className="object-cover" />
                <AvatarFallback className="bg-[#111111] text-2xl font-bold text-[#E5E5E5]">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-semibold tracking-tight text-[#E5E5E5]">
                  {user.username}
                </CardTitle>
                <CardDescription className="mt-1 text-[#E5E5E5]/55">
                  {user.email}
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setShowComposer(true)}
              className="bg-[#3B82F6] text-white hover:bg-[#2563EB]"
            >
              Post Meme
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-t border-white/10 pt-4">
            <h3 className="mb-4 text-lg font-medium text-[#E5E5E5]">Update Avatar</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar-upload" className="text-[#E5E5E5]/80">Choose Image</Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer border-white/10 bg-[#0F0F0F] text-[#E5E5E5]/70 file:mr-4 file:rounded-md file:border-0 file:bg-[#171717] file:px-3 file:py-1.5 file:text-[#E5E5E5] hover:file:bg-[#222222]"
                />
              </div>
              <Button
                type="submit"
                disabled={!file || loading}
                className="w-full bg-[#3B82F6] text-white hover:bg-[#2563EB]"
              >
                {loading ? 'Uploading...' : 'Upload Avatar'}
              </Button>
              {message && (
                <div className={`rounded-md border p-3 text-sm font-medium ${message.includes('success') ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-red-500/30 bg-red-500/10 text-red-200'}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </CardContent>
      </Card>

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 p-4 sm:items-center">
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
    </motion.div>
  );
}
