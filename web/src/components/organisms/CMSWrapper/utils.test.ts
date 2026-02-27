import { describe, test, expect } from "vitest";

import { userRightsGet } from "./utils";

describe("userRightsGet", () => {
  test("OWNER has full permissions", () => {
    const rights = userRightsGet("OWNER");
    expect(rights.role).toBe("OWNER");
    expect(rights.workspace).toEqual({ update: true, delete: true });
    expect(rights.project.create).toBe(true);
    expect(rights.project.delete).toBe(true);
    expect(rights.members.invite).toBe(true);
    expect(rights.members.changeRole).toBe(true);
    expect(rights.content.update).toBe(true);
    expect(rights.content.delete).toBe(true);
    expect(rights.request.approve).toBe(true);
    expect(rights.apiKey.create).toBe(true);
    expect(rights.apiKey.delete).toBe(true);
  });

  test("MAINTAINER cannot update/delete workspace", () => {
    const rights = userRightsGet("MAINTAINER");
    expect(rights.role).toBe("MAINTAINER");
    expect(rights.workspace).toEqual({ update: false, delete: false });
    expect(rights.project.create).toBe(true);
    expect(rights.project.delete).toBe(true);
    expect(rights.members.invite).toBe(true);
    expect(rights.content.update).toBe(true);
    expect(rights.request.approve).toBe(true);
  });

  test("WRITER has limited permissions with null for own-only fields", () => {
    const rights = userRightsGet("WRITER");
    expect(rights.role).toBe("WRITER");
    expect(rights.workspace).toEqual({ update: false, delete: false });
    expect(rights.workspaceSetting.update).toBe(false);
    expect(rights.integrations.connect).toBe(false);
    expect(rights.members.invite).toBe(false);
    expect(rights.members.leave).toBe(true);
    expect(rights.project.create).toBe(true);
    expect(rights.project.update).toBe(false);
    expect(rights.content.create).toBe(true);
    expect(rights.content.update).toBeNull();
    expect(rights.content.delete).toBeNull();
    expect(rights.asset.update).toBeNull();
    expect(rights.asset.delete).toBeNull();
    expect(rights.request.approve).toBe(false);
    expect(rights.request.update).toBeNull();
    expect(rights.comment.update).toBeNull();
    expect(rights.view.create).toBe(false);
  });

  test("READER has read-only permissions", () => {
    const rights = userRightsGet("READER");
    expect(rights.role).toBe("READER");
    expect(rights.workspace).toEqual({ update: false, delete: false });
    expect(rights.project.create).toBe(false);
    expect(rights.project.read).toBe(true);
    expect(rights.project.update).toBe(false);
    expect(rights.model.create).toBe(false);
    expect(rights.model.read).toBe(true);
    expect(rights.schema.create).toBe(false);
    expect(rights.schema.read).toBe(true);
    expect(rights.content.create).toBe(false);
    expect(rights.content.read).toBe(true);
    expect(rights.content.update).toBe(false);
    expect(rights.asset.create).toBe(false);
    expect(rights.asset.read).toBe(true);
    expect(rights.request.approve).toBe(false);
    expect(rights.members.leave).toBe(true);
  });

  test("unknown role defaults to READER permissions", () => {
    const rights = userRightsGet("UNKNOWN" as never);
    expect(rights.project.create).toBe(false);
    expect(rights.project.read).toBe(true);
    expect(rights.content.create).toBe(false);
  });
});
