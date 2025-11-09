export async function metabaseApiCall(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>,
  params?: Record<string, string>,
): Promise<unknown> {
  const baseUrl = Deno.env.get("METABASE_BASE_URL") || "http://localhost:3000";
  const apiKey = Deno.env.get("METABASE_API_KEY");

  if (!apiKey) {
    throw new Error("METABASE_API_KEY not configured");
  }

  let url = `${baseUrl}/${endpoint.replace(/^\//, "")}`;
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  const response = await fetch(url, {
    method: method.toUpperCase(),
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    const text = await response.text();
    throw new Error(`Non-JSON response: ${text}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API error (${response.status}): ${JSON.stringify(data)}`);
  }

  return data;
}
