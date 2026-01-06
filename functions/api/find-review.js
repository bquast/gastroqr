export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    if (!query) {
        return new Response('Missing query', { status: 400 });
    }

    try {
        // Fetch Place ID from Google Places API
        const googleUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${env.GOOGLE_API_KEY}`;
        const googleRes = await fetch(googleUrl);
        const googleData = await googleRes.json();

        if (googleData.status !== 'OK' || !googleData.candidates.length) {
            return new Response('Place not found', { status: 404 });
        }

        const placeId = googleData.candidates[0].place_id;
        const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

        // Generate short code (simple unique string, base36 for shortness)
        let shortCode;
        do {
            shortCode = Math.random().toString(36).substring(2, 8); // ~6 chars, low collision risk
        } while (await env.URL_KV.get(shortCode)); // Check for existence

        // Store in KV
        await env.URL_KV.put(shortCode, reviewUrl);

        // Return short URL
        const shortUrl = `https://${request.headers.get('host')}/s/${shortCode}`;
        return new Response(JSON.stringify({ shortUrl }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(`Error: ${err.message}`, { status: 500 });
    }
}