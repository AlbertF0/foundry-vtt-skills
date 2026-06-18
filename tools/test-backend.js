// Prueba del backend MCP por su puerto de control (31414).
// Uso: node test-backend.js tools/list
//      node test-backend.js tools/call <tool> '<json-args>'
const net = require('net');

const [, , method, toolName, argsJson] = process.argv;
const payload =
  method === 'tools/call'
    ? { id: 1, method: 'call_tool', params: { name: toolName, arguments: JSON.parse(argsJson || '{}') } }
    : { id: 1, method: 'list_tools' };

const socket = net.connect(31414, '127.0.0.1', () => {
  socket.write(JSON.stringify(payload) + '\n');
});

let buffer = '';
socket.on('data', chunk => {
  buffer += chunk.toString();
  if (buffer.includes('\n')) {
    const msg = JSON.parse(buffer.split('\n')[0]);
    if (method === 'tools/call') {
      console.log(JSON.stringify(msg, null, 2));
    } else {
      const tools = msg.result?.tools ?? [];
      console.log(`TOTAL: ${tools.length}`);
      for (const t of tools) console.log(`- ${t.name}`);
    }
    socket.end();
    process.exit(0);
  }
});
socket.on('error', e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
setTimeout(() => { console.error('TIMEOUT'); process.exit(1); }, 60000);
