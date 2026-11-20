import {trackAi} from './aiTiming';
let key='',model='gpt-4.1-mini';
export function configureVision(value:string,name:string){if(!/^[\x21-\x7E]{1,500}$/.test(value)||!/^gpt-[a-zA-Z0-9.-]{1,90}$/.test(name))throw new Error('请填写有效的 OpenAI 密钥与支持图片的 GPT 模型名称');key=value;model=name}
export const hasVisionKey=()=>!!key;
export async function explainFigure(image:string,text:string,signal?:AbortSignal){if(!key)throw new Error('请先配置图像解读连接');return trackAi('vision',async()=>{const r=await fetch('/api/material-ai',{method:'POST',headers:{'Content-Type':'application/json','X-Vision-Key':key},body:JSON.stringify({action:'figure-vision',model,image,text:text.slice(0,6000)}),signal});const v=await r.json();if(!r.ok)throw new Error(v.error||'图像解读暂未完成');if(typeof v.value?.text!=='string'||!v.value.text.trim()||v.value.text.length>12000)throw new Error('未收到完整的图像解读');return v.value.text as string})}
