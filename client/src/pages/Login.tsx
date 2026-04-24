import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/users/login', { email, password });
      const token = response.data?.data?.token;
      // Fetch user profile right after login if login only returns token

      // console.log("FULL RESPONSE:", response);
      // console.log("RESPONSE.DATA:", response.data);

      let userData = response.data?.data?.user;

      if (!userData && typeof token === 'string') {
        // If login only gives the token, we need to inject it first
        localStorage.setItem('token', token);
        const meResponse = await api.get('/users/avatar');
        userData = meResponse.data.user || meResponse.data;
      }

      login(typeof token === 'string' ? token : response.data.token, userData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-[80vh] items-center justify-center px-4"
    >
      <Card className="w-full max-w-md border-white/10 bg-[#171717]/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-semibold tracking-tight text-[#E5E5E5]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-[#E5E5E5]/60">
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm font-medium text-red-200">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#E5E5E5]/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="meme@lord.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-white/10 bg-[#0F0F0F] text-[#E5E5E5] placeholder:text-[#E5E5E5]/35 focus-visible:border-[#3B82F6] focus-visible:ring-[#3B82F6]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#E5E5E5]/80">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-white/10 bg-[#0F0F0F] text-[#E5E5E5] placeholder:text-[#E5E5E5]/35 focus-visible:border-[#3B82F6] focus-visible:ring-[#3B82F6]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-[#3B82F6] text-white hover:bg-[#2563EB]"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-center text-sm font-medium text-[#E5E5E5]/60">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#3B82F6] hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
