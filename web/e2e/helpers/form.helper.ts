import { expect } from "@reearth-cms/e2e/fixtures/test";
import type { Locator } from "@reearth-cms/e2e/fixtures/test";

/**
 * Fill an input and confirm the value stuck.
 *
 * Metadata forms auto-save on change and re-render from the response, which
 * silently discards a fill that landed mid-render — the next save then
 * persists the old value behind a success notification. A plain assertion only
 * detects that; retrying the fill is the only way through it.
 */
export async function fillAndSettle(
  input: Locator,
  value: string,
  timeout = 15_000,
): Promise<void> {
  await expect(async () => {
    await input.fill(value);
    await expect(input).toHaveValue(value, { timeout: 2_000 });
  }).toPass({ timeout });
}
