import {Link} from 'react-router-dom';
import type {ReadingMaterial} from './labTypes';
import {UniversalReading} from './UniversalReading';
import {needsChineseTranslation} from './preparedCourse';
export function PreparedSourceComparison({material,selected,onClear,onClose}:{material:ReadingMaterial;selected?:string[];onClear?:()=>void;onClose:()=>void}){
 const all=material.preparedParagraphs||[],rows=selected?.length?all.filter(p=>selected.includes(p.id)):all;
 return <aside className="pixel-panel source-comparison" aria-label="对照原文"><header><h2>对照原文</h2><button onClick={onClose} aria-label="收起原文">×</button></header><p className="source-help">{selected?.length?'当前教学小节对应原文':'本课引用的原文'} · 双语内容已随备课保存</p>{selected?.length&&<button className="text-button" onClick={onClear}>查看本课全部原文</button>}{rows.map(p=><article className="prepared-source-paragraph" key={p.id}><p className="source-name">{p.name} · {p.kind==='text'?'文本段':'PDF页'} {p.page}</p><UniversalReading text={p.text} documentId={'book:'+p.bookId+':paragraph:'+p.id} emphasis={false}/>{p.zh?<div className="source-aid-result"><small>中文辅助译文 · 已保存</small><p>{p.zh}</p></div>:needsChineseTranslation(p.text)?<p role="status">这段双语尚未备齐，请回到备课页继续准备。</p>:null}<Link className="source-open-book" to={'/books/'+encodeURIComponent(p.bookId)+'?reference=1&page='+p.page+'&courseId='+encodeURIComponent(material.courseId||'')}>查看原资料 →</Link></article>)}</aside>;
}
