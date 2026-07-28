import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground font-sans p-6">
      <div className="space-y-6 text-center max-w-md">
        <h1 className="text-9xl font-extrabold tracking-tighter text-primary animate-pulse">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Halaman tidak ditemukan</h2>
          <p className="text-muted-foreground">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        <div className="pt-6">
          <Button asChild variant="default" size="lg" className="rounded-md shadow-md transition-transform hover:scale-105 active:scale-95">
            <Link to="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
