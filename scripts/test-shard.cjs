// Ejecuta la misma lista de npm test, dividida para aislar fallas y reducir memoria por runner.
const { spawnSync } = require('node:child_process');
const pkg = require('../package.json');
const tests = pkg.scripts.test.split(' && ').map(x => x.trim());
const split = tests.findIndex(x => x.includes('tests/pago-mensual.cjs'));
if (split < 1) throw new Error('No se encontró el límite entre grupos de pruebas');
const group = Number(process.argv[2]);
if (group !== 1 && group !== 2) throw new Error('Grupo de pruebas inválido');
const selected = group === 1 ? tests.slice(0, split) : tests.slice(split);
for (const cmd of selected) {
  const args = cmd.split(/\s+/);
  console.log('\n>>> ' + cmd);
  const run = spawnSync(args[0], args.slice(1), { stdio: 'inherit', env: process.env });
  if (run.error) throw run.error;
  if (run.status !== 0) process.exit(run.status || 1);
}
console.log('Grupo ' + group + ' aprobado: ' + selected.length + ' verificaciones.');
