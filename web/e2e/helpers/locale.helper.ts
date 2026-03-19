import { type Page } from "@playwright/test";

export async function forceEnglishLocale(page: Page): Promise<void> {
  await page.route("**/api/graphql", async (route, request) => {
    let postData: Record<string, unknown> | null = null;
    try {
      postData = request.postDataJSON?.();
    } catch {
      // multipart/form-data (file uploads) — not JSON, skip interception
    }
    if (postData?.operationName === "GetLanguage") {
      const response = await route.fetch();
      const json = await response.json();
      if (json?.data?.me) {
        json.data.me.lang = "en";
      }
      await route.fulfill({ response, json });
      return;
    }
    await route.continue();
  });
}
