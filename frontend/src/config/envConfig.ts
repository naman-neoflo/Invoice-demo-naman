interface EnvConfig {
  BE_BASE_URL: string;
  [key: string]: string | undefined;
}

const getEnvironmentConfig = (): EnvConfig => {
  const isBrowser = typeof window !== "undefined";
  if (isBrowser && (window as { _env_?: EnvConfig })._env_) {
    return (window as { _env_?: EnvConfig })._env_ as EnvConfig;
  }
  return {
    // In the browser: prefer an explicit public URL, otherwise use "" so all
    // API calls are relative (e.g. /api/v1/…) and route through the Next.js
    // rewrite proxy → backend.  This avoids CORS issues in local dev entirely.
    // On the server-side (SSR): fall back to BE_BASE_URL for direct calls.
    BE_BASE_URL:
      process.env.NEXT_PUBLIC_BE_BASE_URL ||
      (isBrowser ? "" : process.env.BE_BASE_URL || "http://localhost:8099"),
  };
};

export const envConfig = Object.freeze(getEnvironmentConfig());
