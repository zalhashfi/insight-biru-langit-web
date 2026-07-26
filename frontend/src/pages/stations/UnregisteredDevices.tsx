import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';

// API Fetcher
const fetchUnregisteredDevices = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/stations/unregistered', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch unregistered devices');
  }
  return res.json();
};

export const UnregisteredDevices = () => {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unregisteredDevices'],
    queryFn: fetchUnregisteredDevices,
    refetchInterval: 30000 // auto refresh every 30s
  });

  const handleRegister = (macAddress: string) => {
    // Navigate to add station page with pre-filled mac address
    navigate(`/stations/add?mac=${macAddress}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unregistered Devices</h2>
          <p className="text-muted-foreground">
            Devices that attempted to connect but are not registered in the system.
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-600 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error loading unregistered devices. Please try again.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Attempted Connections (Last 24 Hours)</CardTitle>
            <CardDescription>
              MAC addresses logged when devices fail authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">Loading...</div>
            ) : data?.data && data.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MAC Address</TableHead>
                    <TableHead>Last Attempt At</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((device: any) => (
                    <TableRow key={device.macAddress}>
                      <TableCell className="font-mono">{device.macAddress}</TableCell>
                      <TableCell>{new Date(device.lastSeenAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleRegister(device.macAddress)}>
                          <Plus className="mr-1 h-4 w-4" /> Register
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No unregistered devices found in the last 24 hours.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
