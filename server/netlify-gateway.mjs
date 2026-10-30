import {learningApi} from './learning-api.mjs';

// Netlify streaming functions end at 60s. Return our resumable error before the
// platform terminates the process; this also bounds search/fetch subrequests.
export async function netlifyGateway(request,fetcher=fetch,budgetMs=52000){
 const signal=AbortSignal.any([request.signal,AbortSignal.timeout(budgetMs)]);
 const boundedFetch=(url,init={})=>fetcher(url,{...init,signal:AbortSignal.any([signal,...(init.signal?[init.signal]:[])])});
 const response=await learningApi(new Request(request,{signal}),boundedFetch);
 const headers=new Headers(response.headers);headers.set('X-Learning-Host','netlify');
 return new Response(response.body,{status:response.status,headers});
}
