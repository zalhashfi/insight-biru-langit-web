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
import { Badge } from '@/components/ui/badge';

type Station = {
  uuid: string;
  name: string;
  projectName: string;
  type: string;
  macAddress: string | null;
  currentVersion: string | null;
  latitude: number | null;
  longitude: number | null;
};

async function fetchStations(): Promise<Station[]> {
  const res = await fetch('/api/stations', {
    credentials: 'include'
  });
  if (!res.ok) {
    logToCloudflare('error', 'Failed to fetch stations', { status: res.status });
    throw new Error('Failed to fetch stations');
  }
  const data = await res.json();
  return data.stations;
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
              <TableHead>Proyek</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>MAC Address</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Versi Firmware</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations?.map((station) => (
              <TableRow key={station.uuid}>
                <TableCell className="font-medium">{station.name}</TableCell>
                <TableCell>{station.projectName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase">{station.type}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{station.macAddress || '-'}</TableCell>
                <TableCell>
                  {station.latitude && station.longitude 
                    ? `${station.latitude}, ${station.longitude}` 
                    : '-'}
                </TableCell>
                <TableCell>{station.currentVersion || '-'}</TableCell>
              </TableRow>
            ))}
            {stations?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Belum ada alat yang terdaftar.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
