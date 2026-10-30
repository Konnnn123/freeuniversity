import type {PdfBook} from './bookStore';
// Old request objects contained nodeId:undefined. Object spread overwrote the
// authoritative draft ID. Only recover an absent ID from its existing map key
// when the saved structure and all source ranges agree; never rename conflicts.
export function restoreTeachingIdentities(input:PdfBook){
 const book=structuredClone(input);let changed=false;
 for(const [id,p]of Object.entries(book.teachingDrafts||{})){
  const node=book.structure?.nodes.find(n=>n.id===id);
  if(!p||p.nodeId!==undefined||!node||node.start===null||node.end===null||typeof p.id!=='string'||!Array.isArray(p.segments)||!p.segments.length||p.segments.some(s=>!s||typeof s.text!=='string'||!Number.isInteger(s.from)||!Number.isInteger(s.to)||s.from<node.start!||s.to<s.from||s.to>node.end!))continue;
  p.nodeId=id;changed=true;
 }
 if(changed&&!book.teachingIdentityBackup)book.teachingIdentityBackup={at:new Date().toISOString(),drafts:structuredClone(input.teachingDrafts)};
 return {book,changed};
}
