import {useEffect,useState} from 'react';
import './bookStructureRecovery.css';
import type {PdfBook} from './bookStore';
import {adoptDiscovery,learningSegments,type PdfDiscovery} from './pdfDiscovery';
import type {PdfStructure} from './pdfStructure';

export function BookStructureRecovery({book,disabled,onScan,onApply,onRead,onRange}:{book:PdfBook;disabled:boolean;onScan:()=>void;onApply:(structure:PdfStructure)=>Promise<void>;onRead:(page:number)=>void;onRange:(start:number,end:number)=>void}){
 const [draft,setDraft]=useState<PdfDiscovery|undefined>(book.discovery),[error,setError]=useState(''),[start,setStart]=useState(1),[end,setEnd]=useState(Math.min(5,book.numPages));
 const savedDraft=JSON.stringify(book.discovery);
 useEffect(()=>{setDraft(book.discovery)},[savedDraft]);
 const hasStructure=!!book.structure?.nodes.length,diagnosis=book.discovery?.diagnosis;
 const edit=(i:number,field:'title'|'start'|'end',value:string)=>setDraft(d=>d?{...d,rows:d.rows.map((r,j)=>i===j?{...r,[field]:field==='title'?value:value===''?null:Number(value)}:r)}:d);
 return <details className="pixel-panel section-pad pdf-recovery" open={!hasStructure||undefined}><summary>{hasStructure?'目录补充与按页码备课':'这份 PDF 没有电子书签，也可以备课'}</summary>
 <p>先识别书内目录并核对实际页码，再生成课程。全程在本地处理，不调用 AI；已有章节和已备内容会保留。</p>
 {diagnosis&&<p className="muted">已检查 {diagnosis.checked}/{book.numPages} 页 · {diagnosis.readable} 页有可读文字{diagnosis.tocPages.length?` · 书内目录候选：PDF ${diagnosis.tocPages.join('、')} 页`:''}{diagnosis.garbled?` · ${diagnosis.garbled} 页存在乱码，需对照原版面`:''}{!diagnosis.readable?' · 可能需要先做 OCR 文字识别后重新导入':''}</p>}
 <div className="actions"><button disabled={disabled} className="primary" onClick={onScan}>识别书内目录与正文标题</button><button disabled={disabled} onClick={()=>{setError('');setDraft(learningSegments(book.numPages,8,diagnosis))}}>没有目录？按 8 页创建学习分段</button></div>
 {draft&&draft.rows.length>0&&<section className="pdf-structure-preview"><h3>预览并确认{draft.source==='printed-toc'?'书内目录':draft.source==='headings'?'正文标题':'学习分段'}</h3><p>这里填写的是阅读器中的 PDF 实际页码。可修改或移除候选项；书内印刷页码可能与 PDF 页码不同。学习分段只用于安排学习，不代表原书章节。</p><div className="pdf-candidate-list">{draft.rows.map((r,i)=><article className="book-index-item" key={r.id}><label>名称<input aria-label={`第 ${i+1} 项名称`} value={r.title} disabled={disabled} onChange={e=>edit(i,'title',e.target.value)}/></label><div className="form-row"><label>PDF 起始页<input type="number" min="1" max={book.numPages} value={r.start??''} disabled={disabled} onChange={e=>edit(i,'start',e.target.value)}/></label><label>PDF 结束页<input type="number" min="1" max={book.numPages} value={r.end??''} disabled={disabled} onChange={e=>edit(i,'end',e.target.value)}/></label></div><small>{r.printedStart!==undefined?`书内页码 ${r.printedStart}${r.printedEnd!==undefined?'–'+r.printedEnd:''} · `:''}{r.note}</small><div className="actions">{r.tocPage&&<button disabled={disabled} onClick={()=>onRead(r.tocPage!)}>对照目录页</button>}{r.start&&<button disabled={disabled} onClick={()=>onRead(r.start!)}>对照起始页</button>}{r.end&&<button disabled={disabled} onClick={()=>onRead(r.end!)}>对照结束页</button>}<button disabled={disabled} onClick={()=>setDraft(d=>d?{...d,rows:d.rows.filter((_,j)=>j!==i)}:d)}>移除此项</button></div></article>)}</div><button disabled={disabled} className="primary" onClick={async()=>{try{setError('');await onApply(adoptDiscovery(draft,book.numPages,book.structure));setDraft(undefined)}catch(e){setError((e as Error).message)}}}>已核对，采用这些范围 →</button></section>}
 {draft&&!draft.rows.length&&<p>没有找到可靠的目录标题。可以按页码分段，或在下方直接选一段备课。</p>}
 {error&&<p role="alert" className="lab-error">{error}</p>}
 <details className="pdf-direct-range"><summary>直接按页码范围备课</summary><p>不需要目录。提取一段可读原文到备课室，再生成课时；图纸、表格和尺寸仍应对照 PDF 原版面。</p><div className="form-row"><label>PDF 起始页<input type="number" min="1" max={book.numPages} disabled={disabled} value={start} onChange={e=>setStart(Number(e.target.value))}/></label><label>PDF 结束页<input type="number" min={start} max={book.numPages} disabled={disabled} value={end} onChange={e=>setEnd(Number(e.target.value))}/></label></div><button disabled={disabled} onClick={()=>onRange(start,end)}>提取这部分并进入备课室 →</button></details>
 </details>
}
