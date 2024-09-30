import { Role, UserRights } from "@reearth-cms/components/molecules/Member/types";

export const userRightsGet = (role: Role): UserRights => {
  switch (role) {
    case "OWNER":
      return {
        role,
        workspace: {
          remove: true,
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
        schema: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        model: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
        content: {
          create: true,
          read: true,
          update: true,
          delete: true,
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
          delete: true,
          approve: true,
          deny: true,
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
          remove: true,
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
        schema: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
        model: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
        content: {
          create: true,
          read: true,
          update: true,
          delete: true,
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
          delete: true,
          approve: true,
          deny: true,
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
          remove: false,
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
        schema: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        model: {
          create: false,
          read: true,
          update: false,
          delete: false,
          publish: false,
        },
        content: {
          create: true,
          read: true,
          update: true,
          delete: true,
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
          delete: true,
          approve: false,
          deny: false,
        },
        comment: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      };
    case "READER":
    default:
      return {
        role,
        workspace: {
          remove: false,
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
        schema: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        model: {
          create: false,
          read: true,
          update: false,
          delete: false,
          publish: false,
        },
        content: {
          create: false,
          read: true,
          update: false,
          delete: false,
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
          delete: false,
          approve: false,
          deny: false,
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
