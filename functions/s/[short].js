export async function onRequestGet(context) {
    const { params, env } = context;
    const shortCode = params.short;

    const url = await env.URL_KV.get(shortCode);
    if (url) {
        return Response.redirect(url, 301);
    }
    return new Response('Not found', { status: 404 });
}