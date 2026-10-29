declare module '*.mjs' {export function learningApi(request:Request,fetcher?:typeof fetch):Promise<Response>;export function gateway():import('vite').Plugin}

declare module '*?url' {const value:string;export default value}
declare module 'pdfjs-dist/legacy/build/pdf.mjs' {export {getDocument,version} from 'pdfjs-dist'}
