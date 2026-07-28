import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import NetworkBackground from '@/components/three/NetworkBackground';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col items-center justify-center font-sans">
      <NetworkBackground />
      
      <main className="z-10 flex flex-col items-center justify-center p-8 text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground font-sans">
            Insight Laboratory
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto tracking-tight">
            IoT Monitoring & Analytics Platform by Biru Langit
          </p>
        </div>
        
        <div className="pt-4">
          <Link to="/login">
            <Button size="lg" className="h-12 px-8 text-lg font-semibold rounded-md shadow-lg transition-transform hover:scale-105 active:scale-95">
              Masuk
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
