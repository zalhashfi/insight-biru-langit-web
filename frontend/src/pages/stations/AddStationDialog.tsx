import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logToCloudflare } from '@/utils/logger';

export function AddStationDialog() {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const prefilledMac = searchParams.get('mac') || '';
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    projectName: '',
    macAddress: prefilledMac,
    type: 'aqms',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    if (prefilledMac) {
      setFormData(prev => ({ ...prev, macAddress: prefilledMac }));
      setOpen(true);
    }
  }, [prefilledMac]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        uuid: crypto.randomUUID(),
        name: data.name,
        projectName: data.projectName,
        type: data.type,
        ...(data.macAddress ? { macAddress: data.macAddress } : {}),
        ...(data.latitude ? { latitude: parseFloat(data.latitude) } : {}),
        ...(data.longitude ? { longitude: parseFloat(data.longitude) } : {})
      };
      
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add station');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      setOpen(false);
      setFormData({ name: '', projectName: '', macAddress: '', type: 'aqms', latitude: '', longitude: '' });
      if (prefilledMac) {
        navigate('/stations'); // clear mac from url
      }
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logToCloudflare('info', 'User attempted to add a station', { action: 'add_station', formData });
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Tambah Alat</Button>} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Alat Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail stasiun alat baru.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nama</Label>
            <Input 
              id="name" 
              placeholder="Stasiun Gamma" 
              className="col-span-3"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectName" className="text-right">Proyek</Label>
            <Input 
              id="projectName" 
              placeholder="Biru Langit" 
              className="col-span-3"
              value={formData.projectName}
              onChange={e => setFormData({ ...formData, projectName: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Tipe Alat</Label>
            <div className="col-span-3">
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v || '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aqms">AQMS</SelectItem>
                  <SelectItem value="soc">SOC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="macAddress" className="text-right">MAC Address</Label>
            <Input 
              id="macAddress" 
              placeholder="AA:BB:CC:DD:EE:FF" 
              className="col-span-3 font-mono"
              value={formData.macAddress}
              onChange={e => setFormData({ ...formData, macAddress: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="latitude" className="text-right">Latitude</Label>
            <Input 
              id="latitude" 
              placeholder="-7.250445" 
              className="col-span-3"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={e => setFormData({ ...formData, latitude: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="longitude" className="text-right">Longitude</Label>
            <Input 
              id="longitude" 
              placeholder="112.768845" 
              className="col-span-3"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={e => setFormData({ ...formData, longitude: e.target.value })}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
