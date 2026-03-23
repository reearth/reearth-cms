import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { VRTWrapper } from "@reearth-cms/test/vrt-utils";

import AccountSettings from ".";

const noopAsync = async () => {};

const mockUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  lang: "en",
};

describe("[Visual] AccountSettings", () => {
  test("loading state", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <AccountSettings
            loading={true}
            onUserUpdate={noopAsync}
            onLanguageUpdate={noopAsync}
            onUserDelete={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });

  test("default with user data", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <AccountSettings
            me={mockUser}
            loading={false}
            onUserUpdate={noopAsync}
            onLanguageUpdate={noopAsync}
            onUserDelete={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expect.element(page.getByTestId(DATA_TEST_ID.VRT__Root)).toMatchScreenshot();
  });
});
