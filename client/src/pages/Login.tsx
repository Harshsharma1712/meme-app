import React, { useState } from 'react';
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
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm font-medium text-red-400 bg-red-950/50 rounded-md border border-red-900/50">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="meme@lord.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-violet-500 focus-visible:border-violet-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-sm text-center text-zinc-400 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 hover:underline transition-colors">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
