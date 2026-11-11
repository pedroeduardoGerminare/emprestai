import {test} from 'node:test';
import assert from 'node:assert/strict';
import {safeUrl,validateReview,equipment} from './pipeline.mjs';
const rows = () => equipment.map((e,i) => ({patrimonio:e.patrimonio,id:i+1,author:'Autor',authorURL:'https://pixabay.com/users/autor-1/',pageURL:'https://pixabay.com/photos/example/',imageURL:'https://cdn.pixabay.com/photo/example.jpg',license:'Pixabay Content License',licenseURL:'https://pixabay.com/service/license-summary/',approved:true,reason:'Inspeção registrada'}));
test('rejeita origem externa, http, credenciais e segredo na URL',()=>{
  for(const url of ['http://pixabay.com/x','https://pixabay.com.evil.test/x','https://user:pass@pixabay.com/x','https://cdn.pixabay.com/x?key=secret']) assert.throws(()=>safeUrl(url));
  assert.equal(safeUrl('https://cdn.pixabay.com/photo/x.jpg').hostname,'cdn.pixabay.com');
});
test('rejeita ausência de revisão visual e duplicação de imagem/patrimônio',()=>{
  assert.doesNotThrow(()=>validateReview(rows()));
  for(const change of [r=>r[0].approved=false,r=>r[0].reason='',r=>r[0].id=r[1].id,r=>r[0].patrimonio=r[1].patrimonio,r=>r.pop()]) {const data=rows();change(data);assert.throws(()=>validateReview(data));}
});
