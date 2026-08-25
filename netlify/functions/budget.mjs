import { getStore } from "@netlify/blobs";

const KEY = "state";

function store() {
  return getStore({ name: "trip-budget", consistency: "strong" });
}

export default async (req) => {
  try {
    if (req.method === "GET") {
      const data = await store().get(KEY, { type: "json" });
      return new Response(JSON.stringify(data ?? null), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (!body || !Array.isArray(body.categories)) {
        return new Response(JSON.stringify({ error: "bad payload" }), {
          status: 400,
          headers: { "content-type": "application/json" }
        });
      }
      await store().setJSON(KEY, body);
      return new Response(JSON.stringify({ ok: true, updated: body.updated ?? null }), {
        headers: { "content-type": "application/json" }
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
};

export const config = { path: "/api/budget" };
