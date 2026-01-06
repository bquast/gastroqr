export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    if (!query) {
        return new Response('Missing query', { status: 400 });
    }

    try {
        const apiUrl = 'https://places.googleapis.com/v1/places:searchText';
        const body = JSON.stringify({
            textQuery: query,
            pageSize: 10, // Max 20, but 10 for UX
            regionCode: 'CH', // Bias to Switzerland
            locationBias: {
                rectangle: {
                    low: { latitude: 45.817, longitude: 5.955 },
                    high: { latitude: 47.808, longitude: 10.493 }
                }
            }
        });

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': env.GOOGLE_API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName.text,places.formattedAddress'
            },
            body: body
        });

        const data = await response.json();
        if (!data.places) {
            return new Response('No places found', { status: 404 });
        }

        const places = data.places.map(place => ({
            id: place.id,
            name: place.displayName.text,
            address: place.formattedAddress
        }));

        return new Response(JSON.stringify({ places }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(`Error: ${err.message}`, { status: 500 });
    }
}