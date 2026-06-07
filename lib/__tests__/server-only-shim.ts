// No-op shim so vitest can load Next.js server-only modules in unit tests.
// The real `server-only` package throws when imported in client bundles;
// in unit tests there is no bundle distinction, so this empty module is safe.
export {};
