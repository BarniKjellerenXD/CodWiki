import test from 'node:test'
import assert from 'node:assert/strict'
import {shatteredCipher,reckoningElement,reckoningFiles,samFiles,periodicElements} from '../app/utils/bo6Dlc.mjs'
test('Nursery photo yields all four documented protocol codes',()=>{
  const groups={'group-0':'E','group-1':'BCDSTVWXZ','group-2':'KLMNPQR','group-3':'OUY','group-4':'FGHJ','group-5':'AI'}
  for(const [word,code] of Object.entries({CRAB:'9729',YETI:'3192',MOTH:'7394',WORM:'9377'})) assert.equal(shatteredCipher({...groups,word}).code,code)
})
test('cipher validates missing, duplicate, non-letter and overlong observations',()=>{
  assert.equal(shatteredCipher({word:'YETI'}).status,'waiting')
  assert.equal(shatteredCipher({word:'YETI','group-0':'YY'}).status,'invalid')
  assert.equal(shatteredCipher({word:'YETI','group-0':'Y','group-1':'YZ'}).status,'invalid')
  assert.equal(shatteredCipher({word:'YETI','group-0':'Y2'}).status,'invalid')
  assert.equal(shatteredCipher({word:'YETI','group-0':'ABCDEFGHIJ'}).status,'invalid')
})
test('cipher permits only needed complete clusters and whitespace',()=>{
  assert.equal(shatteredCipher({word:'moth','group-0':'M','group-1':'O T H'}).code,'1333')
})
test('Reckoning initials preserve monitor order and pad atomic numbers',()=>{
  assert.equal(reckoningElement({screens:'Two words',first:'Copper',second:'Umbrella'}).code,'029')
  assert.equal(reckoningElement({screens:'One word',first:'Carbon',second:'Invalid stale word'}).code,'006')
  assert.equal(reckoningElement({screens:'Two words',first:'U',second:'C'}).status,'invalid')
  assert.equal(reckoningElement({screens:'Two words',first:'C'}).status,'waiting')
  assert.equal(reckoningElement({first:'C',second:'U'}).status,'waiting')
  assert.equal(periodicElements.length,118)
  assert.equal(reckoningElement({screens:'Two words',first:'O',second:'G'}).code,'118')
})
test('archive code follows dates regardless of selection order',()=>{
  assert.equal(reckoningFiles({katana:true,scarf:true,badge:true,watch:true}).code,'6342')
  assert.equal(reckoningFiles({badge:true,collar:true,scarf:true,goggles:true}).code,'6135')
  assert.equal(reckoningFiles({badge:true}).status,'waiting')
  assert.equal(reckoningFiles(Object.fromEntries(samFiles.map(row=>[row.id,true]))).status,'invalid')
  assert.equal(reckoningFiles({badge:'true',collar:true,scarf:true,watch:true}).status,'waiting')
})
