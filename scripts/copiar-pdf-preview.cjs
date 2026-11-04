const fs=require('node:fs'),path=require('node:path');
const version=require('pdfjs-dist/package.json').version;
const origen=path.dirname(require.resolve('pdfjs-dist/package.json'));
const destino=path.resolve(__dirname,'../public/pdfjs-'+version);
fs.mkdirSync(destino,{recursive:true});
for(const nombre of ['pdf.min.mjs','pdf.worker.min.mjs'])fs.copyFileSync(path.join(origen,'legacy/build',nombre),path.join(destino,nombre));
for(const nombre of ['standard_fonts','wasm'])fs.cpSync(path.join(origen,nombre),path.join(destino,nombre),{recursive:true});
console.log('Visor PDF local preparado · '+version);
