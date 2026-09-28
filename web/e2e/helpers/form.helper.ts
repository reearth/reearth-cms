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

/**
 * Drive a switch to a given state.
 *
 * Same clobbering as {@link fillAndSettle}, but a toggle cannot be retried
 * blindly — a second click would undo the first. Click only while the switch
 * is not yet in the wanted state, which makes the retry idempotent.
 */
export async function setSwitchState(
  toggle: Locator,
  checked: boolean,
  timeout = 15_000,
): Promise<void> {
  const expected = String(checked);
  await expect(async () => {
    if ((await toggle.getAttribute("aria-checked")) !== expected) {
      await toggle.click();
    }
    await expect(toggle).toHaveAttribute("aria-checked", expected, { timeout: 2_000 });
  }).toPass({ timeout });
}
