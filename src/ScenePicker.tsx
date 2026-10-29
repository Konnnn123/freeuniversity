import {campusSpaces,type CampusSpace} from './campusSpaces';

function SceneStamp({theme}:{theme:CampusSpace['theme']}){
 const tree=(x:number,y:number)=><g transform={`translate(${x} ${y})`}><path fill="#9b856b" d="M8 17h4v14H8z"/><path fill="#7e9c7d" d="M3 6h15v15H3zM0 10h21v8H0z"/><path fill="#b3c799" d="M5 2h11v14H5zM2 6h17v8H2z"/><path fill="#d1dba8" d="M6 5h5v3H6z"/></g>;
 return <svg viewBox="0 0 80 56" className={'scene-stamp stamp-'+theme} shapeRendering="crispEdges" aria-hidden="true">
  <path fill={theme==='library'?'#e4d4b7':theme==='studio'?'#ddd3e4':'#d4dfb9'} d="M0 0h80v56H0z"/>
  {theme==='campus'&&<><path fill="#eae2c5" d="M0 47h80v9H0zM35 33h12v23H35z"/>{tree(3,16)}<path fill="#9a8796" d="M26 20h44v28H26z"/><path fill="#f6e9cb" d="M29 22h38v23H29z"/><path fill="#8797ae" d="M23 19h5v-5h5V9h30v5h5v5h5v5H23z"/><path fill="#b4c6cc" d="M34 28h7v9h-7zM55 28h7v9h-7z"/><path fill="#998790" d="M45 32h7v13h-7zM44 3h11v17H44z"/><path fill="#f9eecf" d="M46 5h7v10h-7z"/><path fill="#9c8a99" d="M49 7h2v5h-3v-2h1z"/></>}
  {theme==='library'&&<><path fill="#c0a68b" d="M0 44h80v12H0z"/><path fill="#9d8995" d="M7 8h27v33H7z"/><path fill="#f2e3c6" d="M10 11h21v9H10zM10 24h21v12H10z"/><path fill="#acba92" d="M12 12h5v8h-5zM21 26h5v10h-5z"/><path fill="#c39caa" d="M19 12h6v8h-6zM12 26h6v10h-6z"/><path fill="#a4b8c7" d="M26 12h3v8h-3z"/><path fill="#a2929b" d="M47 8h24v21H47z"/><path fill="#d5e7df" d="M50 11h18v15H50z"/><path fill="#fff5d4" d="M58 11h2v15h-2zM50 18h18v2H50z"/><path fill="#a28b7c" d="M39 36h34v5H39zM42 41h4v12h-4zM66 41h4v12h-4z"/><path fill="#faf1d3" d="M48 30h15v6H48z"/></>}
  {theme==='studio'&&<><path fill="#bdab99" d="M0 46h80v10H0z"/><path fill="#a38c73" d="M23 8h4v44h-4zM18 33h4v19h-4zM39 32h4v20h-4z"/><path fill="#9f8b98" d="M13 10h33v29H13z"/><path fill="#fff0d3" d="M16 13h27v23H16z"/><path fill="#b9cca0" d="M20 25h18v7H20zM23 21h11v4H23z"/><path fill="#d4a7b6" d="M29 17h9v7h-9z"/><path fill="#9e8a76" d="M51 36h25v4H51zM54 40h4v12h-4zM70 40h4v12h-4z"/><path fill="#cbaa87" d="M62 27h10v9H62z"/><path fill="#afc197" d="M65 14h4v14h-4zM60 18h5v6h-5zM69 12h6v7h-6z"/></>}
  {theme==='forest'&&<><path fill="#eee3bd" d="M29 56V41h6V29h12v12h6v15z"/>{tree(3,8)}{tree(54,3)}<path fill="#a58b7a" d="M44 36h22v5H44zM46 42h3v9h-3zM61 42h3v9h-3z"/><path fill="#d9aab8" d="M9 45h5v5H9zM68 47h5v5h-5z"/><path fill="#eff0c0" d="M16 36h5v5h-5z"/></>}
  {theme==='courtyard'&&<><path fill="#eee3c7" d="M0 38h80v18H0z"/><path fill="#a8b2ac" d="M9 16h42v23H9z"/><path fill="#9dc6c7" d="M12 19h36v17H12z"/><path fill="#d9e7d7" d="M16 24h11v2H16zM30 30h13v2H30z"/>{tree(55,4)}<path fill="#a68d77" d="M36 43h23v5H36zM38 48h3v6h-3zM54 48h3v6h-3z"/><path fill="#d4a7b5" d="M8 45h5v5H8zM19 47h5v5h-5z"/></>}
 </svg>;
}

export function ScenePicker({activeId,onChoose}:{activeId:string;onChoose:(id:string)=>void}){
 return <aside className="scene-picker pixel-panel"><header><span className="eyebrow">LITTLE PLACES</span><h2>校园场景 <small>05</small></h2></header>
  <nav aria-label="切换校园场景">{campusSpaces.map(s=><button type="button" key={s.id} className={'scene-picker-card '+(s.id===activeId?'active':'')} aria-pressed={s.id===activeId} title={s.description} onClick={()=>onChoose(s.id)}>
   <SceneStamp theme={s.theme}/><span className="scene-picker-copy"><small>{s.indoor?'室内':'户外'}<span className="scene-picker-current"> · 正在这里</span></small><strong>{s.name}</strong></span><span className="scene-picker-marker" aria-hidden="true">◆</span>
  </button>)}</nav><p className="scene-picker-foot">选一个地方，待一会儿。</p>
 </aside>;
}
