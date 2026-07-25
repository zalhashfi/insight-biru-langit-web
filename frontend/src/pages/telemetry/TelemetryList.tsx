import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Telemetry = {
  id: string;
  stationId: string;
  stationName: string;
  pm25: number;
  temperature: number;
  humidity: number;
  timestamp: string;
};

async function fetchTelemetry(): Promise<Telemetry[]> {
  const res = await fetch('/api/telemetry');
  if (!res.ok) throw new Error('Failed to fetch telemetry');
  return res.json();
}

export function TelemetryList() {
  const { data: telemetries, isLoading, isError } = useQuery({
    queryKey: ['telemetry'],
    queryFn: fetchTelemetry,
  });

  if (isLoading) return <div className="p-4">Loading data...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading data.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sensor (Telemetry)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Nama Alat</TableHead>
              <TableHead>PM2.5 (µg/m³)</TableHead>
              <TableHead>Suhu (°C)</TableHead>
              <TableHead>Kelembapan (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {telemetries?.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{new Date(data.timestamp).toLocaleString('id-ID')}</TableCell>
                <TableCell className="font-medium">{data.stationName}</TableCell>
                <TableCell>{data.pm25}</TableCell>
                <TableCell>{data.temperature}</TableCell>
                <TableCell>{data.humidity}</TableCell>
              </TableRow>
            ))}
            {telemetries?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Belum ada data sensor.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
