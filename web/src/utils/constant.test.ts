import { expect, test } from "vitest";
import * as z from "zod";

import { Constant } from "./constant";

test("Validate alias length data type and range", () => {
  const ALIAS_LENGTH_VALIDATOR = z.number().nonnegative().int();
  const minLengthValidation = ALIAS_LENGTH_VALIDATOR.safeParse(Constant.PROJECT_ALIAS.MIN_LENGTH);
  const maxLengthValidation = ALIAS_LENGTH_VALIDATOR.safeParse(Constant.PROJECT_ALIAS.MAX_LENGTH);

  if (!minLengthValidation.success) throw z.prettifyError(minLengthValidation.error);
  if (!maxLengthValidation.success) throw z.prettifyError(maxLengthValidation.error);
});

test("Check alias max length is larger then min length", () => {
  const diff = Constant.PROJECT_ALIAS.MAX_LENGTH > Constant.PROJECT_ALIAS.MIN_LENGTH;
  expect(diff).toBeTruthy();
});
