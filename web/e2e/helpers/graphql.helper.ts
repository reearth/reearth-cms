import type { Page, Response } from "@reearth-cms/e2e/fixtures/test";

/**
 * Waits for a GraphQL response while performing an action.
 * Ensures the API call completes before proceeding.
 */
export async function waitForGraphQL(
  page: Page,
  action: () => Promise<void>,
  options?: { timeout?: number },
): Promise<Response> {
  const [response] = await Promise.all([
    page.waitForResponse(
      resp => resp.url().includes("/graphql") && resp.request().method() === "POST",
      { timeout: options?.timeout ?? 30_000 },
    ),
    action(),
  ]);
  return response;
}
