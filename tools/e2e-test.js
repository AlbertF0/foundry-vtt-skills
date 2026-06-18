// Prueba de extremo a extremo de las tools world-builder vía puerto de control.
const net = require('net');

function call(name, args) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(31414, '127.0.0.1', () => {
      socket.write(JSON.stringify({ id: 1, method: 'call_tool', params: { name, args } }) + '\n');
    });
    let buffer = '';
    socket.on('data', chunk => {
      buffer += chunk.toString();
      const nl = buffer.indexOf('\n');
      if (nl !== -1) {
        const msg = JSON.parse(buffer.slice(0, nl));
        socket.end();
        const text = msg.result?.content?.[0]?.text ?? JSON.stringify(msg.result);
        resolve({ isError: !!msg.result?.isError, text });
      }
    });
    socket.on('error', reject);
    setTimeout(() => reject(new Error('timeout')), 60000);
  });
}

async function main() {
  const fs = require('fs');
  const steps = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  for (const [name, args] of steps) {
    try {
      const r = await call(name, args);
      console.log(`\n### ${name} ${JSON.stringify(args)}`);
      console.log(r.isError ? `  ❌ ${r.text}` : `  ✅ ${r.text}`);
    } catch (e) {
      console.log(`\n### ${name}\n  💥 ${e.message}`);
    }
  }
}
main();
