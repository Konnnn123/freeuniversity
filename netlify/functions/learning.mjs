import {netlifyGateway} from '../../server/netlify-gateway.mjs';

export default request=>netlifyGateway(request);

// Custom paths keep the browser API same-origin. No redirects or stored keys.
export const config={path:['/api/app-info','/api/material-ai','/api/material-search','/api/learning-diagnostic']};
