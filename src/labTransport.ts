export class LabApiError extends Error {code:string;diagnostic?:Record<string,unknown>;constructor(message:string,code:string,diagnostic?:Record<string,unknown>){super(message);this.name='LabApiError';this.code=code;this.diagnostic=diagnostic}}
type Context={action:string;release:string};
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
function responseProblem(response:Response,context:Context,kind='invalid_gateway_response'):LabApiError {
 const status=response.status,requestId=(response.headers.get('x-learning-request')||response.headers.get('cf-ray')||response.headers.get('x-nf-request-id')||'').replace(/[^a-zA-Z0-9-]/g,'').slice(0,100),contentType=(response.headers.get('content-type')||'unknown').slice(0,120);
 const message=status===404?'当前部署没有找到 AI 接口，需要部署本站配套的服务端函数；重复生成或重传 PDF 无法修复此问题。':response.redirected||status===401||status===403?'网站登录或访问验证未通过，请刷新网站确认登录后继续。':status===504||status===524?'网站网关等待超时，未取得生成结果。':status===502||status===503?'网站网关暂时无法连接生成服务。':'网站返回了空响应或非接口内容，未取得生成结果。';
 return new LabApiError(`${message}（HTTP ${status}）已保存的目录和内容保留，未自动重发。`,kind,{...context,httpStatus:status,contentType,requestId});
}
function resultBody(body:unknown,status:number,response:Response,context:Context){
 if(!object(body))throw responseProblem(response,context);
 if(status<200||status>=300||body.error){if(typeof body.error!=='string')throw responseProblem(response,context);throw new LabApiError(body.error+(body.code?'（错误类型：'+body.code+'）':''),body.code||'request_failed',{...context,httpStatus:status,...(object(body.details)?body.details:{})})}
 return body;
}
export async function readLabResponse(response:Response,context:Context){
 if(!response.headers.get('content-type')?.includes('application/x-ndjson')){let body;try{body=await response.json()}catch{throw responseProblem(response,context,response.ok?'invalid_gateway_response':'gateway_http_'+response.status)}return resultBody(body,response.status,response,context)}
 if(!response.ok||!response.body)throw responseProblem(response,context);
 const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',size=0,requestId='';
 const consume=(line:string)=>{if(!line.trim())return;let event;try{event=JSON.parse(line)}catch{throw responseProblem(response,context,'invalid_progress_response')}if(!object(event))throw responseProblem(response,context,'invalid_progress_response');if(event.type==='start'){if(typeof event.requestId==='string')requestId=event.requestId.slice(0,100);return}if(event.type==='heartbeat')return;if(event.type!=='result'||!Number.isInteger(event.status))throw responseProblem(response,context,'invalid_progress_response');return resultBody(event.body,event.status,response,context)};
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024*1024)throw responseProblem(response,context,'gateway_response_too_large');buffer+=decoder.decode(value,{stream:true});let at;while((at=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,at);buffer=buffer.slice(at+1);const result=consume(line);if(result)return result}}buffer+=decoder.decode();if(buffer.trim()){const result=consume(buffer);if(result)return result}throw new LabApiError('生成连接在返回结果前中断；目录和已保存正文保留，未自动重发。','generation_connection_closed',{...context,httpStatus:response.status,requestId})}catch(e){if(e instanceof LabApiError||(e as Error).name==='AbortError')throw e;throw new LabApiError('读取生成结果时连接中断；已保存内容保留，未自动重发。','generation_connection_closed',{...context,httpStatus:response.status,requestId})}finally{await reader.cancel().catch(()=>{});reader.releaseLock()}
}
