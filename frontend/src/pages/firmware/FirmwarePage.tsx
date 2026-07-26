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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Firmware = {
  id: string;
  version: string;
  url: string;
  releaseNotes: string;
  createdAt: string;
};

async function fetchFirmwares(): Promise<Firmware[]> {
  const res = await fetch('/api/firmware', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch firmware');
  return res.json();
}

export function FirmwarePage() {
  const { data: firmwares, isLoading, isError } = useQuery({
    queryKey: ['firmware'],
    queryFn: fetchFirmwares,
  });

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Firmware Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-2">
              <Label htmlFor="version">Versi</Label>
              <Input id="version" placeholder="Contoh: 2.1.0" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">Link Firmware</Label>
              <Input id="url" type="url" placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan Rilis</Label>
              <Input id="notes" placeholder="Perbaikan sensor..." />
            </div>
            <Button type="submit" className="w-fit">Tambah Firmware</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen Firmware</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div>Loading data...</div>}
          {isError && <div className="text-red-500">Error loading data.</div>}
          {!isLoading && !isError && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versi</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {firmwares?.map((fw) => (
                  <TableRow key={fw.id}>
                    <TableCell className="font-medium">{fw.version}</TableCell>
                    <TableCell>
                      <a href={fw.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {fw.url}
                      </a>
                    </TableCell>
                    <TableCell>{fw.releaseNotes}</TableCell>
                    <TableCell>{new Date(fw.createdAt).toLocaleDateString('id-ID')}</TableCell>
                  </TableRow>
                ))}
                {firmwares?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Belum ada firmware yang diunggah.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
