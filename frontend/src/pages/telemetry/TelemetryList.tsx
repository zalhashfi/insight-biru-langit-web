import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
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

async function fetchTelemetry(stationUuid: string) {
  if (!stationUuid) return { type: '', data: [] };
  const res = await fetch(`/api/data/${stationUuid}/history?limit=100`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch telemetry');
  return res.json();
}

export function TelemetryList() {
  const [selectedStationUuid, setSelectedStationUuid] = useState<string>('');

  const { data: stations, isLoading: isLoadingStations } = useQuery({
    queryKey: ['stations'],
    queryFn: fetchStations,
  });

  const { data: telemetryResult, isLoading: isLoadingTelemetry, isError } = useQuery({
    queryKey: ['telemetry', selectedStationUuid],
    queryFn: () => fetchTelemetry(selectedStationUuid),
    enabled: !!selectedStationUuid,
  });

  const selectedStation = stations?.find(s => s.uuid === selectedStationUuid);
  const type = telemetryResult?.type;
  const telemetries = telemetryResult?.data || [];

  const chartConfig: ChartConfig = type === 'aqms' ? {
    pm25: { label: 'PM 2.5', color: 'hsl(var(--chart-1))' },
    temperature: { label: 'Suhu', color: 'hsl(var(--chart-2))' },
    humidity: { label: 'Kelembapan', color: 'hsl(var(--chart-3))' },
  } : {
    moisture: { label: 'Moisture', color: 'hsl(var(--chart-1))' },
    temperature: { label: 'Suhu', color: 'hsl(var(--chart-2))' },
    ph: { label: 'pH', color: 'hsl(var(--chart-3))' },
  };

  // reverse telemetries for chart so oldest is first (usually history API returns descending)
  const chartData = [...telemetries].reverse().map(item => ({
    ...item,
    time: new Date(item.measuredAt || item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Sensor (Telemetry)</CardTitle>
          <CardDescription>Pilih Stasiun untuk melihat data sensor terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStations ? (
            <p>Loading stations...</p>
          ) : (
            <Select onValueChange={(v) => setSelectedStationUuid(v || '')} value={selectedStationUuid}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Pilih Stasiun" />
              </SelectTrigger>
              <SelectContent>
                {stations?.map(station => (
                  <SelectItem key={station.uuid} value={station.uuid}>
                    {station.name} ({station.type.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedStationUuid && (
        <>
          {isLoadingTelemetry && <div className="p-4">Loading data...</div>}
          {isError && <div className="p-4 text-destructive">Error loading data.</div>}
          {!isLoadingTelemetry && !isError && telemetries.length === 0 && (
            <div className="p-4">Belum ada data sensor.</div>
          )}

          {!isLoadingTelemetry && !isError && telemetries.length > 0 && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Grafik Data Sensor - {selectedStation?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <LineChart data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
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
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Tabel Riwayat - {selectedStation?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waktu</TableHead>
                        {type === 'aqms' ? (
                          <>
                            <TableHead>PM2.5 (µg/m³)</TableHead>
                            <TableHead>Suhu (°C)</TableHead>
                            <TableHead>Kelembapan (%)</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead>Moisture</TableHead>
                            <TableHead>Suhu (°C)</TableHead>
                            <TableHead>pH</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {telemetries.map((data: any) => (
                        <TableRow key={data.id}>
                          <TableCell>{new Date(data.measuredAt || data.timestamp).toLocaleString('id-ID')}</TableCell>
                          {type === 'aqms' ? (
                            <>
                              <TableCell>{data.pm25}</TableCell>
                              <TableCell>{data.temperature}</TableCell>
                              <TableCell>{data.humidity}</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{data.moisture}</TableCell>
                              <TableCell>{data.temperature}</TableCell>
                              <TableCell>{data.ph}</TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
