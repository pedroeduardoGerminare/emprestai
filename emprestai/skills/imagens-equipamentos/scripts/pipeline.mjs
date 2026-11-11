#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const hash = data => createHash('sha256').update(data).digest('hex');
const DAY = 86_400_000;
export const equipment = [
  ['TI-0001','Notebook 14 polegadas','notebook','laptop on white desk'],
  ['TI-0002','Notebook 15 polegadas','notebook','open laptop minimal desk'],
  ['TI-0003','Notebook 13 polegadas','notebook','laptop closeup keyboard'],
  ['TI-0004','Notebook 15 polegadas','notebook','closed laptop on table'],
  ['TI-0005','Monitor 24 polegadas','monitor','computer monitor on desk'],
  ['TI-0006','Monitor 27 polegadas','monitor','monitor screen office desk'],
  ['TI-0007','Monitor 22 polegadas','monitor','black computer screen'],
  ['TI-0008','Cabo HDMI 2 m','cabo','hdmi cable'],
  ['TI-0009','Cabo USB-C 1 m','cabo','usb cable white background'],
  ['TI-0010','Cabo de rede 3 m','cabo','ethernet cable'],
  ['TI-0011','Webcam Full HD','camera','webcam'],
  ['TI-0012','Câmera compacta','camera','compact camera on table'],
].map(([patrimonio,nome,categoria,busca]) => ({patrimonio,nome,categoria,busca}));

export function safeUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !['pixabay.com','cdn.pixabay.com'].includes(url.hostname)
      || url.username || url.password || url.port || url.searchParams.has('key')) {
    throw new Error('URL de imagem não permitida');
  }
  return url;
}

async function request(url, image = false) {
  for (let redirects = 0; redirects <= 3; redirects++) {
    let response;
    try { response = await fetch(url, {redirect:'manual', signal:AbortSignal.timeout(20_000)}); }
    catch { throw new Error('Falha de rede ou tempo limite; detalhes privados omitidos'); }
    if (response.status >= 300 && response.status < 400) {
      if (!image) throw new Error('Redirecionamento inesperado da API');
      url = safeUrl(new URL(response.headers.get('location') || '', url).href);
      continue;
    }
    if (!response.ok) throw new Error(`Pixabay respondeu HTTP ${response.status}; corpo omitido`);
    if (image && !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Resposta não é imagem');
    const limit = image ? 20_000_000 : 5_000_000;
    const parts = []; let size = 0;
    for await (const part of response.body) {
      size += part.length;
      if (size > limit) throw new Error('Resposta excedeu limite de tamanho');
      parts.push(part);
    }
    return Buffer.concat(parts);
  }
  throw new Error('Limite de redirecionamentos excedido');
}

export function validateReview(rows) {
  if (!Array.isArray(rows) || rows.length !== 12) throw new Error('Revisão deve conter os 12 equipamentos');
  const assets = new Set(), ids = new Set();
  for (const row of rows) {
    if (!equipment.some(e => e.patrimonio === row.patrimonio) || assets.has(row.patrimonio)) throw new Error('Patrimônio inválido ou repetido');
    assets.add(row.patrimonio);
    if (row.approved !== true || typeof row.reason !== 'string' || !row.reason.trim()) throw new Error('Revisão visual explícita obrigatória');
    if (!Number.isSafeInteger(row.id) || row.id < 1 || ids.has(row.id)) throw new Error('ID inválido ou foto repetida');
    ids.add(row.id);
    if (!row.author || !row.authorURL || !row.pageURL || !row.imageURL || !row.license || !row.licenseURL) throw new Error('Origem e licença obrigatórias');
    safeUrl(row.pageURL); safeUrl(row.imageURL); safeUrl(row.licenseURL); safeUrl(row.authorURL);
  }
}

async function candidates(dir) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) throw new Error('Configure PIXABAY_API_KEY no ambiente privado');
  const rows = [];
  for (const item of equipment) {
    const cache = join(dir, `${hash(item.busca)}.json`);
    let cached;
    try { cached = JSON.parse(await readFile(cache,'utf8')); } catch {}
    if (!cached || Date.now()-cached.time >= DAY || cached.time > Date.now()) {
      const url = new URL('https://pixabay.com/api/');
      for (const [k,v] of Object.entries({key,q:item.busca,image_type:'photo',safesearch:'true',min_width:'800',min_height:'600',per_page:'5'})) url.searchParams.set(k,v);
      let data;
      try { data = JSON.parse((await request(url)).toString()); } catch { throw new Error(`Não foi possível buscar ${item.patrimonio}; detalhes privados omitidos`); }
      cached = {time:Date.now(), hits:data.hits};
      await writeFile(cache,JSON.stringify(cached,null,2));
    }
    rows.push({...item,candidates:(cached.hits || []).map(hit => ({id:hit.id,pageURL:hit.pageURL,imageURL:hit.largeImageURL,author:hit.user,authorURL:`https://pixabay.com/users/${encodeURIComponent(hit.user)}-${hit.user_id}/`,license:'Pixabay Content License',licenseURL:'https://pixabay.com/service/license-summary/',approved:false,reason:''}))});
  }
  await writeFile(join(dir,'candidates.json'),JSON.stringify(rows,null,2));
  console.log('Candidatos preparados; selecione e revise uma foto por patrimônio em review.json.');
}

async function prepare(dir) {
  const rows = JSON.parse(await readFile(join(dir,'review.json'),'utf8'));
  validateReview(rows);
  const selected = JSON.parse(await readFile(join(dir,'candidates.json'),'utf8'));
  for (const row of rows) {
    const candidate = selected.find(item => item.patrimonio === row.patrimonio)?.candidates.find(item => item.id === row.id);
    if (!candidate || ['pageURL','imageURL','author','authorURL','license','licenseURL'].some(key => candidate[key] !== row[key])) throw new Error('Revisão diverge dos candidatos obtidos pela API');
  }
  const {default:sharp} = await import('sharp');
  const output = join(dir,'prepared'); await mkdir(output,{recursive:true});
  const hashes = new Set(); const manifest = [];
  for (const row of rows) {
    const input = await request(safeUrl(row.imageURL),true);
    const final = await sharp(input,{limitInputPixels:80_000_000}).rotate().resize(800,600,{fit:'cover'}).jpeg({quality:88}).toBuffer();
    const info = await sharp(final).metadata();
    if (info.width !== 800 || info.height !== 600) throw new Error('Dimensões finais inválidas');
    const sha256 = hash(final);
    if (hashes.has(sha256)) throw new Error('Arquivo final repetido');
    hashes.add(sha256);
    const file = `${row.patrimonio}.jpg`;
    await writeFile(join(output,file),final);
    manifest.push({...row,sha256,width:800,height:600,file});
  }
  await writeFile(join(output,'manifest.json'),JSON.stringify(manifest,null,2));
  console.log('12 arquivos preparados localmente; nenhum upload executado.');
}

export async function main(args) {
  const [command, directory] = args;
  if (!directory || !['candidates','prepare','validate'].includes(command)) throw new Error('Uso: pipeline.mjs candidates|prepare|validate <diretório-local-ignorado>');
  const dir = resolve(directory); await mkdir(dir,{recursive:true});
  if (command === 'candidates') await candidates(dir);
  if (command === 'prepare') await prepare(dir);
  if (command === 'validate') { validateReview(JSON.parse(await readFile(join(dir,'review.json'),'utf8'))); console.log('Revisão válida; fotos ainda precisam de preparo e conferência final.'); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode=1; });
