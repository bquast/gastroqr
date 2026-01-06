export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const input = url.searchParams.get('input');

    if (!input) {
        return new Response('Missing input', { status: 400 });
    }

    try {
        const apiUrl = 'https://places.googleapis.com/v1/places:autocomplete';
        const body = JSON.stringify({
            input: input,
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
                'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text'
            },
            body: body
        });

        const data = await response.json();
        const suggestions = (data.suggestions || []).filter(sug => sug.placePrediction).map(sug => ({
            placeId: sug.placePrediction.placeId,
            mainText: sug.placePrediction.structuredFormat.mainText.text,
            secondaryText: sug.placePrediction.structuredFormat.secondaryText.text
        }));

        return new Response(JSON.stringify({ suggestions }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(`Error: ${err.message}`, { status: 500 });
    }
}