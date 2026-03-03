import { Role, UserRights } from "@reearth-cms/components/molecules/Member/types";

export const userRightsGet = (role: Role): UserRights => {
  switch (role) {
    case "OWNER":
      return {
        apiKey: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        asset: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        comment: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        content: {
          create: true,
          delete: true,
          publish: true,
          read: true,
          update: true,
        },
        integrations: {
          connect: true,
          delete: true,
          update: true,
        },
        members: {
          changeRole: true,
          invite: true,
          leave: true,
          remove: true,
        },
        model: {
          create: true,
          delete: true,
          publish: true,
          read: true,
          update: true,
        },
        project: {
          create: true,
          delete: true,
          publish: true,
          read: true,
          update: true,
        },
        request: {
          approve: true,
          close: true,
          create: true,
          read: true,
          update: true,
        },
        role,
        schema: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        view: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        workspace: {
          delete: true,
          update: true,
        },
        workspaceSetting: {
          update: true,
        },
      };
    case "MAINTAINER":
      return {
        apiKey: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        asset: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        comment: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        content: {
          create: true,
          delete: true,
          publish: true,
          read: true,
          update: true,
        },
        integrations: {
          connect: true,
          delete: true,
          update: true,
        },
        members: {
          changeRole: true,
          invite: true,
          leave: true,
          remove: true,
        },
        model: {
          create: true,
          delete: true,
          publish: true,
          read: true,
          update: true,
        },
        project: {
          create: true,
          delete: true,
          publish: true,
          read: true,
          update: true,
        },
        request: {
          approve: true,
          close: true,
          create: true,
          read: true,
          update: true,
        },
        role,
        schema: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        view: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        workspace: {
          delete: false,
          update: false,
        },
        workspaceSetting: {
          update: true,
        },
      };
    case "WRITER":
      return {
        apiKey: {
          create: true,
          delete: false,
          read: true,
          update: false,
        },
        asset: {
          create: true,
          delete: null,
          read: true,
          update: null,
        },
        comment: {
          create: true,
          delete: null,
          read: true,
          update: null,
        },
        content: {
          create: true,
          delete: null,
          publish: true,
          read: true,
          update: null,
        },
        integrations: {
          connect: false,
          delete: false,
          update: false,
        },
        members: {
          changeRole: false,
          invite: false,
          leave: true,
          remove: false,
        },
        model: {
          create: true,
          delete: true,
          publish: true,
          read: true,
          update: true,
        },
        project: {
          create: true,
          delete: true,
          publish: true,
          read: true,
          update: false,
        },
        request: {
          approve: false,
          close: null,
          create: true,
          read: true,
          update: null,
        },
        role,
        schema: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        view: {
          create: false,
          delete: false,
          read: true,
          update: false,
        },
        workspace: {
          delete: false,
          update: false,
        },
        workspaceSetting: {
          update: false,
        },
      };
    case "READER":
    default:
      return {
        apiKey: {
          create: false,
          delete: false,
          read: true,
          update: false,
        },
        asset: {
          create: false,
          delete: false,
          read: true,
          update: false,
        },
        comment: {
          create: false,
          delete: false,
          read: true,
          update: false,
        },
        content: {
          create: false,
          delete: false,
          publish: false,
          read: true,
          update: false,
        },
        integrations: {
          connect: false,
          delete: false,
          update: false,
        },
        members: {
          changeRole: false,
          invite: false,
          leave: true,
          remove: false,
        },
        model: {
          create: false,
          delete: false,
          publish: false,
          read: true,
          update: false,
        },
        project: {
          create: false,
          delete: false,
          publish: false,
          read: true,
          update: false,
        },
        request: {
          approve: false,
          close: false,
          create: false,
          read: true,
          update: false,
        },
        role,
        schema: {
          create: false,
          delete: false,
          read: true,
          update: false,
        },
        view: {
          create: false,
          delete: false,
          read: true,
          update: false,
        },
        workspace: {
          delete: false,
          update: false,
        },
        workspaceSetting: {
          update: false,
        },
      };
  }
};
