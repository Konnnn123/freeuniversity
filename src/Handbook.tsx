import {useEffect,useRef,useState,type KeyboardEvent} from 'react';
import {Link,useLocation,useSearchParams} from 'react-router-dom';
import {Icon,Modal} from './ui';
import {handbookChapters,handbookIndex,nextHandbookPage} from './handbookContent';

function HandbookArt(){return <svg viewBox="0 0 152 92" className="handbook-art" shapeRendering="crispEdges" aria-hidden="true">
 <path fill="#d7dfc4" d="M10 76h132v8H10z"/>
 <path fill="#9b899c" d="M26 26h42v-4h16v4h42v48H84v4H68v-4H26z"/>
 <path fill="#f5e7c5" d="M30 30h34v4h8v38h-8v-4H30zM80 34h8v-4h34v38H88v4h-8z"/>
 <path fill="#fff7e6" d="M34 26h30v4h8v34h-8v-4H34zM80 30h8v-4h30v34H88v4h-8z"/>
 <path fill="#c9bba3" d="M42 36h18v2H42zM42 43h22v2H42zM42 50h18v2H42zM90 44h18v2H90zM90 51h20v2H90z"/>
 <path fill="#b1c6a0" d="M92 32h14v8H92z"/><path fill="#cfabc1" d="M102 64h6v18l-3-3-3 3z"/>
 <path fill="#b1c6a0" d="M16 21h4v4h4v4h-4v4h-4v-4h-4v-4h4z"/>
 <path fill="#cfabc1" d="M130 9h4v4h4v4h-4v4h-4v-4h-4v-4h4z"/>
 <path fill="#dfc486" d="M47 8h4v4h4v4h-4v4h-4v-4h-4v-4h4z"/>
 </svg>}

export function HandbookReader({initial='welcome',onFollow}:{initial?:string;onFollow?:()=>void}){
 const [index,setIndex]=useState(()=>handbookIndex(initial)),page=handbookChapters[index];
 const scroll=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null),contents=useRef<HTMLElement>(null);
 useEffect(()=>{contents.current?.querySelector('[aria-current="page"]')?.scrollIntoView({block:'nearest',inline:'nearest'})},[index]);
 const turn=(n:number)=>{setIndex(n);scroll.current?.scrollTo({top:0});requestAnimationFrame(()=>heading.current?.focus({preventScroll:true}))};
 const arrows=(e:KeyboardEvent)=>{if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||(e.target as HTMLElement).closest('input,select,textarea'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();turn(nextHandbookPage(index,e.key==='ArrowRight'?1:-1))}};
 return <div className="handbook-book" onKeyDown={arrows}>
  <aside className="handbook-contents"><div className="handbook-cover"><span className="handbook-cover-label">FREE UNIVERSITY</span><HandbookArt/><h2>校园生活小手册</h2><p>不用一下读完。<br/>需要时，翻到这一页就好。</p></div>
   <nav ref={contents} aria-label="小手册目录">{handbookChapters.map((c,i)=><button key={c.id} className={i===index?'current':''} aria-current={i===index?'page':undefined} onClick={()=>turn(i)}><span>{String(i+1).padStart(2,'0')}</span><Icon name={c.icon} size={16}/>{c.tab}<span className="handbook-tab-arrow" aria-hidden="true">›</span></button>)}</nav>
   <span className="handbook-cover-foot">自由生长，不必赶路。</span>
  </aside>
  <section className="handbook-sheet" aria-label="手册正文"><div className="handbook-page-scroll" ref={scroll}>
   <div className="handbook-sheet-top"><span>FIELD NOTES / {String(index+1).padStart(2,'0')}</span><span aria-hidden="true">✦</span></div>
   <div className="handbook-chapter-icon" aria-hidden="true"><Icon name={page.icon} size={28}/></div>
   <p className="handbook-kicker">{page.kicker}</p><h2 ref={heading} tabIndex={-1}>{page.title}</h2><p className="handbook-intro">{page.intro}</p>
   <ol className="handbook-steps">{page.steps.map((step,i)=><li key={step.title}><span className="handbook-step-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
   <aside className="handbook-note"><Icon name="leaf" size={18}/><div><h3>{page.note.title}</h3><p>{page.note.text}</p></div></aside>
   <div className="handbook-destinations">{page.links.map((link,i)=><Link key={link.to} to={link.to} className={'button '+(i===0?'primary':'')} onClick={onFollow}>{link.label}<span aria-hidden="true"> →</span></Link>)}</div>
  </div><footer className="handbook-pagination"><button disabled={index===0} onClick={()=>turn(nextHandbookPage(index,-1))} aria-label="手册上一页">← 上一页</button><span aria-live="polite" aria-atomic="true"><b>{String(index+1).padStart(2,'0')}</b> / {handbookChapters.length}</span><button disabled={index===handbookChapters.length-1} onClick={()=>turn(nextHandbookPage(index,1))} aria-label="手册下一页">下一页 →</button></footer></section>
 </div>;
}

export function HandbookDialog({onClose}:{onClose:()=>void}){const {pathname}=useLocation();const initial=pathname.startsWith('/build')?'build':pathname.startsWith('/books')?'pdf':pathname.startsWith('/lessons')?'reading':pathname.startsWith('/course-planner')?'planning':pathname.startsWith('/museum')?'rewards':pathname.startsWith('/settings')?'backup':pathname.startsWith('/timetable')?'timetable':pathname.startsWith('/library')?'library':'welcome';return <div className="handbook-dialog"><Modal title="使用手册 · 随手翻一翻" onClose={onClose}><HandbookReader initial={initial} onFollow={onClose}/></Modal></div>}

export function HandbookPage(){const [params]=useSearchParams();return <div className="page handbook-page"><header className="handbook-page-header"><div><span className="eyebrow">YOUR LITTLE CAMPUS HANDBOOK</span><h1>一份随手翻看的校园指南。</h1></div><Link to="/" className="button">← 回校园</Link></header><HandbookReader key={params.get('chapter')||'welcome'} initial={params.get('chapter')||'welcome'}/></div>}
