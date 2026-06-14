/**
 * Renders a JSON-LD structured-data script. Server-only data in, no client
 * JS. Only pass fields that are true for the page - structured data that
 * claims more than the page shows can be penalized.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is server-built from our own data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
