import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Radio, AlertCircle, Clock, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';

type Station = {
  id: string;
  uuid: string;
  name: string;
  type: 'aqms' | 'soc';
};

async function fetchStations(): Promise<Station[]> {
  const res = await fetch('/api/stations', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch stations');
  const json = await res.json();
  return json.stations || [];
}

async function fetchUnregistered() {
  const res = await fetch('/api/stations/unregistered', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch unregistered devices');
  const json = await res.json();
  return json.data || [];
}

async function fetchTelemetry(stationUuid: string) {
  if (!stationUuid) return { type: '', data: [] };
  const res = await fetch(`/api/data/${stationUuid}/history?limit=100`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch telemetry');
  return res.json();
}

export function DashboardHome() {
  const { user } = useAuth();
  
  const canSeeUnregistered = user?.role === 'admin' || user?.role === 'engineer';

  const { data: stations, isLoading: isLoadingStations } = useQuery({
    queryKey: ['stations'],
    queryFn: fetchStations,
  });

  const { data: unregistered } = useQuery({
    queryKey: ['unregistered'],
    queryFn: fetchUnregistered,
    enabled: canSeeUnregistered,
  });

  const firstStationUuid = stations?.[0]?.uuid || '';
  
  const { data: telemetryResult, isLoading: isLoadingTelemetry } = useQuery({
    queryKey: ['telemetry', firstStationUuid],
    queryFn: () => fetchTelemetry(firstStationUuid),
    enabled: !!firstStationUuid,
  });

  const telemetries = telemetryResult?.data || [];
  const type = telemetryResult?.type;
  const lastData = telemetries[0];

  const chartConfig: ChartConfig = type === 'aqms' ? {
    pm25: { label: 'PM 2.5', color: 'hsl(var(--chart-1))' },
    temperature: { label: 'Suhu', color: 'hsl(var(--chart-2))' },
    humidity: { label: 'Kelembapan', color: 'hsl(var(--chart-3))' },
  } : {
    moisture: { label: 'Moisture', color: 'hsl(var(--chart-1))' },
    temperature: { label: 'Suhu', color: 'hsl(var(--chart-2))' },
    ph: { label: 'pH', color: 'hsl(var(--chart-3))' },
  };

  const chartData = [...telemetries].reverse().map((item: any) => ({
    ...item,
    time: new Date(item.measuredAt || item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">Selamat datang kembali, {user?.fullName}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stasiun Aktif</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStations ? '...' : stations?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Alat yang terdaftar dalam sistem
            </p>
          </CardContent>
        </Card>
        
        {canSeeUnregistered && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perlu Didaftarkan</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unregistered ? unregistered.length : 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Perangkat terdeteksi belum diregistrasi
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Terakhir Masuk</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastData ? new Date(lastData.measuredAt || lastData.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lastData ? new Date(lastData.measuredAt || lastData.timestamp).toLocaleDateString('id-ID') : 'Belum ada data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {stations && stations.length > 0 && (
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Trend Sensor - {stations[0].name}
            </CardTitle>
            <CardDescription>
              Menampilkan riwayat data terakhir dari stasiun pertama
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTelemetry ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Memuat data...
              </div>
            ) : telemetries.length > 0 ? (
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <LineChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {Object.entries(chartConfig).map(([key, config]) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={config.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Belum ada data sensor
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
