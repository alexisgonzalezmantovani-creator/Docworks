const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
esbuild.buildSync({entryPoints:[root+'/src/Captcha.ts'],bundle:true,format:'iife',globalName:'DocWorksCaptcha',target:'es2020',outfile:root+'/landing/captcha.js',banner:{js:'// Generado desde src/Captcha.ts por scripts/preparar-acceso.cjs. No editar.'}});
fs.copyFileSync(root+'/public/captcha-config.js',root+'/landing/captcha-config.js');
