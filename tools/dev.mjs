import { spawn } from 'node:child_process';

const port = process.env.PORT || '4200';
const child = spawn('ng', ['serve', '--host', '0.0.0.0', '--port', port], {
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, NG_CLI_ANALYTICS: 'false' },
});
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => child.kill(signal));
}
child.on('exit', code => process.exit(code ?? 1));
