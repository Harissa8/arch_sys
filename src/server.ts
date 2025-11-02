import * as http from 'http';
import * as os from 'os';
import si from 'systeminformation';
import { IncomingMessage, ServerResponse } from 'http';

export async function getSysInfo() {
  // Gather detailed system information using `systeminformation`.
  const [cpu, system, mem, osInfo, currentLoad, processes, diskLayout, networkInterfaces] = await Promise.all([
    si.cpu(),
    si.system(),
    si.mem(),
    si.osInfo(),
    si.currentLoad(),
    si.processes(),
    si.diskLayout(),
    si.networkInterfaces(),
  ]);

  return {
    cpu,
    system,
    mem,
    os: osInfo,
    currentLoad,
    processes,
    diskLayout,
    networkInterfaces,
  };
}

function respondJson(res: ServerResponse, status: number, data: unknown) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body, 'utf8'),
  });
  res.end(body);
}

function respondText(res: ServerResponse, status: number, text: string) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text, 'utf8'),
  });
  res.end(text);
}

export function requestHandler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || '/';
  if (req.method === 'GET' && (url === '/' || url === '/index')) {
    const html = `Hello — this is a tiny server.\n\nEndpoints:\n - /api/v1/sysinfo -> JSON system info`;
    respondText(res, 200, html);
    return;
  }

  if (req.method === 'GET' && url.startsWith('/api/v1/sysinfo')) {
    // getSysInfo is async; handle promise and send JSON when ready
    getSysInfo()
      .then(data => respondJson(res, 200, data))
      .catch(err => respondJson(res, 500, { error: String(err) }));
    return;
  }

  respondText(res, 404, 'Not found');
}

let _server: http.Server | null = null;

export function startServer(port = 8000): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    if (_server) return resolve(_server);
    _server = http.createServer(requestHandler);
    _server.on('error', reject);
    _server.listen(port, () => resolve(_server as http.Server));
  });
}

export function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!_server) return resolve();
    _server.close(err => {
      _server = null;
      if (err) reject(err); else resolve();
    });
  });
}

if (require.main === module) {
  const port = process.env.PORT ? Number(process.env.PORT) : 8000;
  startServer(port).then(() => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`);
  }).catch(err => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
