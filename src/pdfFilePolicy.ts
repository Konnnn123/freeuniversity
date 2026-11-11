export const PDF_MAX_BYTES=100*1024*1024;
export const PDF_LARGE_BYTES=50*1024*1024;
const MB=1024*1024;
export const pdfSizeLabel=(bytes:number)=>(bytes/MB).toFixed(1)+' MB';
export function checkPdfFile(file:Pick<File,'size'>){if(file.size>PDF_MAX_BYTES)throw new Error('PDF 最大支持 100 MB，请压缩图片或拆分文件后导入。');if(file.size===0)throw new Error('PDF 是空文件')}
export interface PdfStorage {remaining?:number;warning?:string}
export async function checkPdfStorage(size:number,storage=typeof navigator==='undefined'?undefined:navigator.storage):Promise<PdfStorage>{
 let estimate:StorageEstimate|undefined;
 try{estimate=await storage?.estimate?.()}catch{/* Unsupported estimates must not prevent local import. */}
 if(!estimate||!Number.isFinite(estimate.quota)||!Number.isFinite(estimate.usage))return {warning:'浏览器暂不能估算剩余空间，保存时会再次检查结果。'};
 const remaining=Math.max(0,estimate.quota!-estimate.usage!);
 if(remaining<size)throw new Error('浏览器剩余空间约 '+pdfSizeLabel(remaining)+'，不足以保存这份 PDF（'+pdfSizeLabel(size)+'）。请先导出备份，再清理不需要的资料。');
 return {remaining,...(remaining<size*2+10*MB?{warning:'可用空间较少，后续提取文字和备课还会占用空间，建议先备份并释放空间。'}:{})};
}
export function pdfFileError(error:unknown){const e=error as {name?:string;message?:string;inner?:{name?:string}};if(e?.name==='QuotaExceededError'||e?.inner?.name==='QuotaExceededError')return '浏览器存储空间不足，PDF 未保存。请先导出备份，再清理不需要的资料后重试。';return e?.message||'PDF 处理失败，请重试或换一个文件。'}
export async function samplePdfText(document:{numPages:number;readPage:(page:number)=>Promise<string>}){const pages=[...new Set([1,Math.ceil(document.numPages/2),document.numPages])];for(const page of pages)if((await document.readPage(page)).trim())return false;return true}
