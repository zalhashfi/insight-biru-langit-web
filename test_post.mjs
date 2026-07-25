import fs from 'fs';

const payload = {
  stationId: "LCS-999",
  temperature: 28.1,
  humidity: 55.2,
  pm25: 18.4,
  co2: 410.0,
  no2: 12.1
};

const res = await fetch('https://insight.biru-langit.com/api/iot/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'e075af1b-942f-425d-aa6e-6927eaac5070'
  },
  body: JSON.stringify(payload)
});

console.log('Status:', res.status);
console.log('Headers:', Object.fromEntries(res.headers.entries()));
const text = await res.text();
console.log('Body:', text);
