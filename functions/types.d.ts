// Minimal ambient types for Cloudflare Pages Functions.
// The `wrangler` / `@cloudflare/workers-types` packages are not required at build time
// for the frontend, and we keep the `functions/` folder out of the Vite build graph.
declare type PagesFunction<Env = unknown, Params extends string = string, Data = unknown> = (
  context: EventContext<Env, Params, Data>
) => Response | Promise<Response>;

interface EventContext<Env, Params extends string, Data> {
  request: Request;
  env: Env;
  params: Record<Params, string | string[]>;
  data: Data;
  next: () => Promise<Response>;
  waitUntil: (p: Promise<unknown>) => void;
}

// Cloudflare-specific `cf` option on fetch RequestInit
interface RequestInitCfProperties {
  cacheEverything?: boolean;
  cacheTtl?: number;
  cacheTtlByStatus?: Record<string, number>;
}
interface RequestInit {
  cf?: RequestInitCfProperties;
}
