// Storage-only, lossless sharing of repeated JSON subtrees. Replay schemas and
// rules checks remain unchanged; old plain JSON records remain readable.
export function encodeRecovery(value) {
 const plain=typeof value==='string'?value:JSON.stringify(value);
 const entries=[],seen=new Map();
 function pack(node){
  if(!node||typeof node!=='object')return node;
  let result=Array.isArray(node)?node.map(pack):Object.fromEntries(Object.entries(node).map(([k,v])=>[k,pack(v)]));
  if(!Array.isArray(node)&&Object.keys(node).length===1&&(Object.hasOwn(node,'$recoveryRef')||Object.hasOwn(node,'$recoveryLiteral')))result={$recoveryLiteral:result};
  const key=JSON.stringify(result);
  if(key.length<128)return result;
  if(seen.has(key))return {$recoveryRef:seen.get(key)};
  const id=entries.length;entries.push(result);seen.set(key,id);return {$recoveryRef:id};
 }
 let parsed;try{parsed=JSON.parse(plain);}catch{return plain;}
 const root=pack(parsed),encoded=JSON.stringify({recovery_encoding:1,entries,root});
 return encoded.length<plain.length?encoded:plain;
}
export function decodeRecovery(raw){
 if(raw===null)return null;
 const data=JSON.parse(raw);if(data.recovery_encoding===undefined)return raw;
 if(data.recovery_encoding!==1||!Array.isArray(data.entries))throw new Error('Unsupported recovery encoding; export the original stored record.');
 const cache=new Map(),active=new Set();
 function unpack(node){
  if(!node||typeof node!=='object')return node;
  if(Object.keys(node).length===1&&Object.hasOwn(node,'$recoveryLiteral'))return Object.fromEntries(Object.entries(node.$recoveryLiteral).map(([k,v])=>[k,unpack(v)]));
  if(Object.keys(node).length===1&&Object.hasOwn(node,'$recoveryRef')){
   const id=node.$recoveryRef;
   if(!Number.isInteger(id)||id<0||id>=data.entries.length||active.has(id))throw new Error('Invalid recovery reference.');
   if(cache.has(id))return cache.get(id);
   active.add(id);const value=unpack(data.entries[id]);active.delete(id);cache.set(id,value);return value;
  }
  return Array.isArray(node)?node.map(unpack):Object.fromEntries(Object.entries(node).map(([k,v])=>[k,unpack(v)]));
 }
 return JSON.stringify(unpack(data.root));
}

export function compactRecoverySlots(storage){
 const keys=['platoon-company-recovery','connected-platoon-company-recovery','platoon-vire-integration','platoon-tinchebray-integration'];
 for(const key of keys.flatMap(k=>[k,k+'-previous'])){
  const raw=storage.getItem(key);if(raw===null)continue;
  // Do not touch corrupt or unsupported records; their exact original remains exportable.
  let decoded;try{decoded=decodeRecovery(raw);}catch{continue;}
  const encoded=encodeRecovery(decoded);if(encoded.length<raw.length)storage.setItem(key,encoded);
 }
}

export function writeRecoveryBundle(storage,key,bundle,previousRaw=null){
 const encoded=encodeRecovery(bundle),backupKey=key+'-previous';
 if(previousRaw===null){storage.setItem(key,encoded);return;}
 const oldBackup=storage.getItem(backupKey);
 storage.setItem(backupKey,encodeRecovery(previousRaw));
 try{storage.setItem(key,encoded);}catch(error){
  // A quota failure must not replace the older backup with a duplicate latest.
  if(oldBackup!==null)storage.setItem(backupKey,oldBackup);
  else storage.removeItem?.(backupKey);
  throw error;
 }
}
