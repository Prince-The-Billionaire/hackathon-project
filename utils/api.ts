// src/utils/api.ts

interface FetchOptions extends RequestInit {
  // Option to skip authentication headers for public endpoints if needed
  public?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://zeon-backend.onrender.com";

/**
 * Custom fetch client that automatically wires global backend content headers
 * and assigns the active Clerk session token context.
 */
export async function createApiClient(getClerkToken: () => Promise<string | null>) {
  return async <T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    const { public: isPublic, headers, ...restOptions } = options;
    
    // Construct uniform baseline headers
    const reqHeaders = new Headers(headers);
    reqHeaders.set("Content-Type", "application/json");

    // Seamlessly fetch and append the Clerk Bearer Token
    if (!isPublic) {
      const token = await getClerkToken();
      if (token) {
        reqHeaders.set("Authorization", `Bearer ${token}`);
      }
    }

    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...restOptions,
      headers: reqHeaders,
    });

    const contentType = response.headers.get("content-type") || "";

    // 1. Check if the response failed (4xx or 5xx)
    if (!response.ok) {
      // Safe fallback processing if the server returned an HTML template instead of JSON
      if (contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      } else {
        const rawText = await response.text();
        // Catch-all context if Render drops a standard gateway timeout or HTML crash template
        console.error("Intercepted Server HTML Error String:", rawText);
        throw new Error(`Backend Server Error (Status ${response.status}). Check server status and endpoint path routes.`);
      }
    }

    // 2. Process successful responses cleanly
    if (contentType.includes("application/json")) {
      return await response.json() as T;
    } else {
      throw new Error("Server returned a successful status code but missing application/json content header mappings.");
    }
  };
}