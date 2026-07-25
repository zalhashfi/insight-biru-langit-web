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
import { AddStationDialog } from './AddStationDialog';

import { logToCloudflare } from '@/utils/logger';

type Station = {
  id: string;
  name: string;
  location: string;
  firmwareVersion: string;
};

async function fetchStations(): Promise<Station[]> {
  const res = await fetch('/api/stations');
  if (!res.ok) {
    logToCloudflare('error', 'Failed to fetch stations', { status: res.status });
    throw new Error('Failed to fetch stations');
  }
  return res.json();
}

export function StationList() {
  const { data: stations, isLoading, isError } = useQuery({
    queryKey: ['stations'],
    queryFn: fetchStations,
  });

  if (isLoading) return <div className="p-4">Loading stations...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading stations.</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daftar Alat (Stations)</CardTitle>
        <AddStationDialog />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Alat</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Versi Firmware</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations?.map((station) => (
              <TableRow key={station.id}>
                <TableCell className="font-medium">{station.name}</TableCell>
                <TableCell>{station.location}</TableCell>
                <TableCell>{station.firmwareVersion}</TableCell>
              </TableRow>
            ))}
            {stations?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Belum ada alat yang terdaftar.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
