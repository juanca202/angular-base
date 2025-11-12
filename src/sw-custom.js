importScripts('./ngsw-worker.js');
importScripts('./firebase-messaging-sw.js');

self.addEventListener('fetch', async (event) => {
  console.log(event);
  /*
    const url = new URL(event.request.url);
    if (
        event.request.method === 'GET' &&
        url.searchParams.get('action') === 'shared-content-receiver'
    ) {
        const formData = await event.request.formData();
        formData.get('text');
        client.postMessage({
            action: 'shared-content-receiver',
            params: {
                title: formData.get('title'),
                text: formData.get('text'),
            }
        });
    }
    */
});
