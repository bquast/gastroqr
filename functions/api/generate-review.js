export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const placeId = url.searchParams.get('place_id');

    if (!placeId) {
        return new Response('Missing place_id', { status: 400 });
    }

    try {
        const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

        // Generate short code
        let shortCode;
        do {
            shortCode = Math.random().toString(36).substring(2, 8);
        } while (await env.URL_KV.get(shortCode));

        await env.URL_KV.put(shortCode, reviewUrl);

        const shortUrl = `https://${request.headers.get('host')}/s/${shortCode}`;
        return new Response(JSON.stringify({ shortUrl }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(`Error: ${err.message}`, { status: 500 });
    }
}