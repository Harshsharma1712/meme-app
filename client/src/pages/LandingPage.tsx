import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="space-y-20 px-4 pb-16 pt-10 sm:px-6 lg:px-8"
    >
      <section className="mx-auto max-w-5xl text-center">
        <p className="mb-4 inline-flex rounded-full border border-[#3B82F6]/40 bg-[#3B82F6]/10 px-4 py-1 text-sm text-[#3B82F6]">
          Share. React. Go Viral.
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-[#E5E5E5] sm:text-6xl">
          The modern space for meme creators and communities.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[#E5E5E5]/65">
          Meme Hub helps you upload, discover, and engage with memes in a clean dark interface built for speed.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button className="bg-[#3B82F6] px-6 text-white hover:bg-[#2563EB]">Start Sharing</Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" className="border border-white/15 px-6 text-[#E5E5E5] hover:bg-white/10">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {['Instant Uploads', 'Live Interactions', 'Creator Profiles'].map((feature) => (
          <Card key={feature} className="border-white/10 bg-[#171717]/80 backdrop-blur-xl">
            <CardContent className="p-5">
              <h3 className="text-lg font-medium text-[#E5E5E5]">{feature}</h3>
              <p className="mt-2 text-sm text-[#E5E5E5]/60">
                Polished, focused UI patterns to keep community engagement high.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* <section className="mx-auto max-w-6xl space-y-4">
        <h2 className="text-2xl font-semibold text-[#E5E5E5]">Trending Previews</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {previewMemes.map((meme, index) => (
            <motion.div
              key={meme.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="border-white/10 bg-[#171717]/70 backdrop-blur-xl">
                <CardContent className="space-y-3 p-4">
                  <div className="h-36 rounded-lg border border-white/10 bg-gradient-to-br from-[#101010] to-[#1E1E1E]" />
                  <p className="font-medium text-[#E5E5E5]">{meme.title}</p>
                  <div className="flex items-center justify-between text-xs text-[#E5E5E5]/60">
                    <span>{meme.subtitle}</span>
                    <span>{meme.likes} likes</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section> */}

      <footer className="mx-auto max-w-6xl border-t border-white/10 pt-6 text-sm text-[#E5E5E5]/45">
        Meme Hub © {new Date().getFullYear()} - Built for meme culture.
      </footer>
    </motion.div>
  );
}
