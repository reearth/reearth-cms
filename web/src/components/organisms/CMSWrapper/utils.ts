import { Role, UserRights } from "@reearth-cms/components/molecules/Member/types";

export const userRightsGet = (role: Role): UserRights => {
  switch (role) {
    case "OWNER":
      return {
        role,
        workspace: {
          update: true,
          delete: true,
        },
        workspaceSetting: {
          update: true,
        },
        integrations: {
          connect: true,
          update: true,
          delete: true,
        },
        members: {
          invite: true,
          remove: true,
          changeRole: true,
          leave: true,
        },
        project: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
        model: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
        schema: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        view: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        content: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
        asset: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        request: {
          create: true,
          read: true,
          update: true,
          close: true,
          approve: true,
        },
        comment: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      };
    case "MAINTAINER":
      return {
        role,
        workspace: {
          update: false,
          delete: false,
        },
        workspaceSetting: {
          update: true,
        },
        integrations: {
          connect: false,
          update: false,
          delete: false,
        },
        members: {
          invite: false,
          remove: false,
          changeRole: false,
          leave: true,
        },
        project: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
        model: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
        schema: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        view: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        content: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
        asset: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        request: {
          create: true,
          read: true,
          update: true,
          close: true,
          approve: true,
        },
        comment: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      };
    case "WRITER":
      return {
        role,
        workspace: {
          update: false,
          delete: false,
        },
        workspaceSetting: {
          update: false,
        },
        integrations: {
          connect: false,
          update: false,
          delete: false,
        },
        members: {
          invite: false,
          remove: false,
          changeRole: false,
          leave: true,
        },
        project: {
          create: false,
          read: true,
          update: false,
          delete: false,
          publish: false,
        },
        model: {
          create: false,
          read: true,
          update: false,
          delete: false,
          publish: false,
        },
        schema: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        view: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        content: {
          create: true,
          read: true,
          update: null,
          delete: null,
          publish: false,
        },
        asset: {
          create: true,
          read: true,
          update: null,
          delete: null,
        },
        request: {
          create: true,
          read: true,
          update: null,
          close: null,
          approve: false,
        },
        comment: {
          create: true,
          read: true,
          update: null,
          delete: null,
        },
      };
    case "READER":
    default:
      return {
        role,
        workspace: {
          update: false,
          delete: false,
        },
        workspaceSetting: {
          update: false,
        },
        integrations: {
          connect: false,
          update: false,
          delete: false,
        },
        members: {
          invite: false,
          remove: false,
          changeRole: false,
          leave: true,
        },
        project: {
          create: false,
          read: true,
          update: false,
          delete: false,
          publish: false,
        },
        model: {
          create: false,
          read: true,
          update: false,
          delete: false,
          publish: false,
        },
        schema: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        view: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        content: {
          create: false,
          read: true,
          update: false,
          delete: false,
          publish: false,
        },
        asset: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        request: {
          create: false,
          read: true,
          update: false,
          close: false,
          approve: false,
        },
        comment: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
      };
  }
};
