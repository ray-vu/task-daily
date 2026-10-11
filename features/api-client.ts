export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init.headers },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const details = body.details
      ?.map(
        (issue: { field: string; message: string }) =>
          `${issue.field}: ${issue.message}`,
      )
      .join("; ");
    throw new Error(
      [body.error || "Unable to save your changes.", details]
        .filter(Boolean)
        .join(" "),
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
