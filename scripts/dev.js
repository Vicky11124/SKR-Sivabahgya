/* `npm run dev`: runs the API server and the Vite dev server together; Ctrl+C stops both */
import { spawn } from 'node:child_process';

const run = (name, args) => {
  const child = spawn(process.execPath, args, { stdio: 'inherit' });
  child.on('exit', code => {
    if (code) console.error(`[${name}] exited with code ${code}`);
    stopAll(code ?? 0);
  });
  return child;
};

const children = [
  run('api', ['--watch-path=server', 'server/index.js']),
  run('web', ['node_modules/vite/bin/vite.js'])
];

let stopping = false;
function stopAll(code) {
  if (stopping) return;
  stopping = true;
  for (const c of children) if (c.exitCode === null) c.kill();
  process.exitCode = code;
}
process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
