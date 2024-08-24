

async function useAuthFetch(url: string | URL | globalThis.Request, headers: RequestInit) {

  const addedAuthHeaders: RequestInit = {
    "credentials": "include", 
    ...headers
  };

  return fetch(url, addedAuthHeaders);
}

export { useAuthFetch };
