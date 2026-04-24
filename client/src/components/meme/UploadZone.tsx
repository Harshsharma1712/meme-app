import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { Input } from '../ui/input';

interface UploadZoneProps {
  id: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadZone({ id, onChange }: UploadZoneProps) {
  return (
    <motion.label
      htmlFor={id}
      whileHover={{ scale: 1.01 }}
      className="relative block cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl border border-[#3B82F6]/60"
        animate={{ opacity: [0.25, 0.9, 0.25] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <UploadCloud className="h-7 w-7 text-[#3B82F6]" />
        <p className="text-sm font-medium text-[#E5E5E5]">Drop your meme image or click to browse</p>
        <p className="text-xs text-[#E5E5E5]/55">PNG, JPG, WEBP</p>
      </div>
      <Input id={id} type="file" accept="image/*" required onChange={onChange} className="hidden" />
    </motion.label>
  );
}
