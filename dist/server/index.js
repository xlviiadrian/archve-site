export default {
  async fetch(request, env) {
    if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {
      return env.ASSETS.fetch(request);
    }
    return new Response("ARCHVE Magazine", { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
};
