// e2e/pages/member.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class MemberPage extends BasePage {
  // Member management - Main table and actions
  get searchInput(): Locator {
    return this.getByTestId("member-search-input");
  }
  get addMemberButton(): Locator {
    return this.getByTestId("member-add-button");
  }
  get removeButton(): Locator {
    return this.getByTestId("member-remove-button");
  }
  get changeRoleButton(): Locator {
    return this.getByTestId("member-change-role-button");
  }
  get leaveButton(): Locator {
    return this.getByTestId("member-leave-button");
  }
  get removeIndividualButton(): Locator {
    return this.getByTestId("member-remove-individual-button");
  }

  // Member Add Modal
  get memberAddModal(): Locator {
    return this.getByTestId("member-add-modal");
  }
  get memberAddSearchInput(): Locator {
    return this.getByTestId("member-add-search-input");
  }
  get memberAddRoleSelect(): Locator {
    return this.getByTestId("member-add-role-select");
  }
  get memberAddRemoveSelectedButton(): Locator {
    return this.getByTestId("member-add-remove-selected-button");
  }
  get memberAddOkButton(): Locator {
    return this.getByTestId("member-add-ok-button");
  }
  get memberAddCancelButton(): Locator {
    return this.getByTestId("member-add-cancel-button");
  }

  // Member Role Modal
  get memberRoleModal(): Locator {
    return this.getByTestId("member-role-modal");
  }
  get memberRoleSelect(): Locator {
    return this.getByTestId("member-role-select");
  }
  get memberRoleOkButton(): Locator {
    return this.getByTestId("member-role-ok-button");
  }
  get memberRoleCancelButton(): Locator {
    return this.getByTestId("member-role-cancel-button");
  }

  // Legacy locators (kept for backwards compatibility with existing tests)
  get memberMenuItem(): Locator {
    return this.getByText("Member");
  }
  get searchButton(): Locator {
    return this.getByRole("button", { name: "search" });
  }
  get clearSearchButton(): Locator {
    return this.getByRole("button", { name: "close-circle" });
  }

  // Dynamic locators for table cells
  cellByText(text: string, exact = false): Locator {
    return this.getByRole("cell", { name: text, exact });
  }
}
