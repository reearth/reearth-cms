import { gql } from "@apollo/client";

export const SEARCH_USER = gql`
  query searchUser($nameOrEmail: String!) {
    searchUser(nameOrEmail: $nameOrEmail) {
      id
      name
      email
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      name
      email
      myWorkspace {
        id
        name
      }
      workspaces {
        id
        name
        members {
          user {
            id
            name
            email
          }
          userId
          role
        }
      }
      auths
    }
  }
`;

export const PROFILE = gql`
  query Profile {
    me {
      id
      name
      email
      lang
      theme
      myWorkspace {
        id
        name
      }
      auths
    }
  }
`;

export const LANGUAGE = gql`
  query Language {
    me {
      id
      lang
    }
  }
`;

export const THEME = gql`
  query Theme {
    me {
      id
      theme
    }
  }
`;

export const UPDATE_ME = gql`
  mutation updateMe(
    $name: String
    $email: String
    $lang: Lang
    $theme: Theme
    $password: String
    $passwordConfirmation: String
  ) {
    updateMe(
      input: {
        name: $name
        email: $email
        lang: $lang
        theme: $theme
        password: $password
        passwordConfirmation: $passwordConfirmation
      }
    ) {
      me {
        id
        name
        email
        lang
        theme
        myWorkspace {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_ME = gql`
  mutation deleteMe($userId: ID!) {
    deleteMe(input: { userId: $userId }) {
      userId
    }
  }
`;
