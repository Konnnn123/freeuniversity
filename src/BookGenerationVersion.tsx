import {useEffect,useState} from 'react';
import {appRelease} from '../server/app-release.mjs';
import {bookTaskRegistry} from './bookTaskRegistry';
import {flushSave} from './store';
export function BookGenerationVersion(){
 const [server,setServer]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{let live=true;const check=()=>{void fetch('/api/app-info',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(v=>{if(live&&typeof v?.release==='string')setServer(v.release)}).catch(()=>{})};check();window.addEventListener('focus',check);return()=>{live=false;window.removeEventListener('focus',check)}},[]);
 const reload=async()=>{if(bookTaskRegistry.getSnapshot().some(t=>t.status==='running')){setMessage('请先暂停正在进行的备课，进度保存后再更新页面。');return}await flushSave();window.location.reload()};
 return <div className="book-generation-version"><small>备课版本 {appRelease}</small>{server&&server!==appRelease&&<p role="alert">网站已有新版，请保存并更新页面后继续。<button onClick={()=>void reload()}>更新页面</button></p>}{message&&<p role="status">{message}</p>}</div>;
}
