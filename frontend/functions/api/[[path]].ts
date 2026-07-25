export const onRequest = async (context) => {
  const url = new URL(context.request.url);
  const targetUrl = new URL(
    url.pathname + url.search,
    'https://backend.rizalhashfi.workers.dev'
  );
  
  const modifiedRequest = new Request(targetUrl, context.request);
  modifiedRequest.headers.set('x-forwarded-host', url.hostname);
  
  return fetch(modifiedRequest);
};
