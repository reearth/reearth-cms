import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Any: any;
  Cursor: string;
  DateTime: Date;
  FileSize: number;
  Lang: string;
  URL: string;
  Upload: any;
};

export type AddMemberToWorkspaceInput = {
  role: Role;
  userId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};

export type AddMemberToWorkspacePayload = {
  __typename?: 'AddMemberToWorkspacePayload';
  workspace: Workspace;
};

export type CreateWorkspaceInput = {
  name: Scalars['String'];
};

export type CreateWorkspacePayload = {
  __typename?: 'CreateWorkspacePayload';
  workspace: Workspace;
};

export type DeleteMeInput = {
  userId: Scalars['ID'];
};

export type DeleteMePayload = {
  __typename?: 'DeleteMePayload';
  userId: Scalars['ID'];
};

export type DeleteWorkspaceInput = {
  workspaceId: Scalars['ID'];
};

export type DeleteWorkspacePayload = {
  __typename?: 'DeleteWorkspacePayload';
  workspaceId: Scalars['ID'];
};

export type Me = {
  __typename?: 'Me';
  auths: Array<Scalars['String']>;
  email: Scalars['String'];
  id: Scalars['ID'];
  lang: Scalars['Lang'];
  myWorkspace: Workspace;
  myWorkspaceId: Scalars['ID'];
  name: Scalars['String'];
  theme: Theme;
  workspaces: Array<Workspace>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addMemberToWorkspace?: Maybe<AddMemberToWorkspacePayload>;
  createWorkspace?: Maybe<CreateWorkspacePayload>;
  deleteMe?: Maybe<DeleteMePayload>;
  deleteWorkspace?: Maybe<DeleteWorkspacePayload>;
  removeMemberFromWorkspace?: Maybe<RemoveMemberFromWorkspacePayload>;
  removeMyAuth?: Maybe<UpdateMePayload>;
  signup?: Maybe<SignupPayload>;
  updateMe?: Maybe<UpdateMePayload>;
  updateMemberOfWorkspace?: Maybe<UpdateMemberOfWorkspacePayload>;
  updateWorkspace?: Maybe<UpdateWorkspacePayload>;
};


export type MutationAddMemberToWorkspaceArgs = {
  input: AddMemberToWorkspaceInput;
};


export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};


export type MutationDeleteMeArgs = {
  input: DeleteMeInput;
};


export type MutationDeleteWorkspaceArgs = {
  input: DeleteWorkspaceInput;
};


export type MutationRemoveMemberFromWorkspaceArgs = {
  input: RemoveMemberFromWorkspaceInput;
};


export type MutationRemoveMyAuthArgs = {
  input: RemoveMyAuthInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUpdateMeArgs = {
  input: UpdateMeInput;
};


export type MutationUpdateMemberOfWorkspaceArgs = {
  input: UpdateMemberOfWorkspaceInput;
};


export type MutationUpdateWorkspaceArgs = {
  input: UpdateWorkspaceInput;
};

export type Node = {
  id: Scalars['ID'];
};

export enum NodeType {
  User = 'USER',
  Workspace = 'WORKSPACE'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['Cursor']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['Cursor']>;
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<Me>;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  searchUser?: Maybe<User>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
  type: NodeType;
};


export type QueryNodesArgs = {
  id: Array<Scalars['ID']>;
  type: NodeType;
};


export type QuerySearchUserArgs = {
  nameOrEmail: Scalars['String'];
};

export type RemoveMemberFromWorkspaceInput = {
  userId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};

export type RemoveMemberFromWorkspacePayload = {
  __typename?: 'RemoveMemberFromWorkspacePayload';
  workspace: Workspace;
};

export type RemoveMyAuthInput = {
  auth: Scalars['String'];
};

export enum Role {
  Owner = 'OWNER',
  Reader = 'READER',
  Writer = 'WRITER'
}

export type SignupInput = {
  lang?: InputMaybe<Scalars['Lang']>;
  secret?: InputMaybe<Scalars['String']>;
  theme?: InputMaybe<Theme>;
  userId?: InputMaybe<Scalars['ID']>;
  workspaceId?: InputMaybe<Scalars['ID']>;
};

export type SignupPayload = {
  __typename?: 'SignupPayload';
  user: User;
  workspace: Workspace;
};

export enum Theme {
  Dark = 'DARK',
  Default = 'DEFAULT',
  Light = 'LIGHT'
}

export type UpdateMeInput = {
  email?: InputMaybe<Scalars['String']>;
  lang?: InputMaybe<Scalars['Lang']>;
  name?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
  passwordConfirmation?: InputMaybe<Scalars['String']>;
  theme?: InputMaybe<Theme>;
};

export type UpdateMePayload = {
  __typename?: 'UpdateMePayload';
  me: Me;
};

export type UpdateMemberOfWorkspaceInput = {
  role: Role;
  userId: Scalars['ID'];
  workspaceId: Scalars['ID'];
};

export type UpdateMemberOfWorkspacePayload = {
  __typename?: 'UpdateMemberOfWorkspacePayload';
  workspace: Workspace;
};

export type UpdateWorkspaceInput = {
  name: Scalars['String'];
  workspaceId: Scalars['ID'];
};

export type UpdateWorkspacePayload = {
  __typename?: 'UpdateWorkspacePayload';
  workspace: Workspace;
};

export type User = Node & {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Workspace = Node & {
  __typename?: 'Workspace';
  id: Scalars['ID'];
  members: Array<WorkspaceMember>;
  name: Scalars['String'];
  personal: Scalars['Boolean'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  role: Role;
  user?: Maybe<User>;
  userId: Scalars['ID'];
};

export type SearchUserQueryVariables = Exact<{
  nameOrEmail: Scalars['String'];
}>;


export type SearchUserQuery = { __typename?: 'Query', searchUser?: { __typename?: 'User', id: string, name: string, email: string } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, email: string, auths: Array<string>, myWorkspace: { __typename?: 'Workspace', id: string, name: string }, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }> } | null };

export type ProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, email: string, lang: string, theme: Theme, auths: Array<string>, myWorkspace: { __typename?: 'Workspace', id: string, name: string } } | null };

export type LanguageQueryVariables = Exact<{ [key: string]: never; }>;


export type LanguageQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, lang: string } | null };

export type ThemeQueryVariables = Exact<{ [key: string]: never; }>;


export type ThemeQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, theme: Theme } | null };

export type UpdateMeMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  lang?: InputMaybe<Scalars['Lang']>;
  theme?: InputMaybe<Theme>;
  password?: InputMaybe<Scalars['String']>;
  passwordConfirmation?: InputMaybe<Scalars['String']>;
}>;


export type UpdateMeMutation = { __typename?: 'Mutation', updateMe?: { __typename?: 'UpdateMePayload', me: { __typename?: 'Me', id: string, name: string, email: string, lang: string, theme: Theme, myWorkspace: { __typename?: 'Workspace', id: string, name: string } } } | null };

export type DeleteMeMutationVariables = Exact<{
  userId: Scalars['ID'];
}>;


export type DeleteMeMutation = { __typename?: 'Mutation', deleteMe?: { __typename?: 'DeleteMePayload', userId: string } | null };

export type WorkspaceFragment = { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> };

export type WorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkspacesQuery = { __typename?: 'Query', me?: { __typename?: 'Me', id: string, name: string, myWorkspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }, workspaces: Array<{ __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> }> } | null };

export type UpdateWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  name: Scalars['String'];
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace?: { __typename?: 'UpdateWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type DeleteWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type DeleteWorkspaceMutation = { __typename?: 'Mutation', deleteWorkspace?: { __typename?: 'DeleteWorkspacePayload', workspaceId: string } | null };

export type AddMemberToWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  userId: Scalars['ID'];
  role: Role;
}>;


export type AddMemberToWorkspaceMutation = { __typename?: 'Mutation', addMemberToWorkspace?: { __typename?: 'AddMemberToWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type UpdateMemberOfWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  userId: Scalars['ID'];
  role: Role;
}>;


export type UpdateMemberOfWorkspaceMutation = { __typename?: 'Mutation', updateMemberOfWorkspace?: { __typename?: 'UpdateMemberOfWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type RemoveMemberFromWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['ID'];
  userId: Scalars['ID'];
}>;


export type RemoveMemberFromWorkspaceMutation = { __typename?: 'Mutation', removeMemberFromWorkspace?: { __typename?: 'RemoveMemberFromWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export type CreateWorkspaceMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace?: { __typename?: 'CreateWorkspacePayload', workspace: { __typename?: 'Workspace', id: string, name: string, personal: boolean, members: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role, user?: { __typename?: 'User', id: string, name: string, email: string } | null }> } } | null };

export const WorkspaceFragmentDoc = gql`
    fragment Workspace on Workspace {
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
  personal
}
    `;
export const SearchUserDocument = gql`
    query searchUser($nameOrEmail: String!) {
  searchUser(nameOrEmail: $nameOrEmail) {
    id
    name
    email
  }
}
    `;

/**
 * __useSearchUserQuery__
 *
 * To run a query within a React component, call `useSearchUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchUserQuery({
 *   variables: {
 *      nameOrEmail: // value for 'nameOrEmail'
 *   },
 * });
 */
export function useSearchUserQuery(baseOptions: Apollo.QueryHookOptions<SearchUserQuery, SearchUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchUserQuery, SearchUserQueryVariables>(SearchUserDocument, options);
      }
export function useSearchUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchUserQuery, SearchUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchUserQuery, SearchUserQueryVariables>(SearchUserDocument, options);
        }
export type SearchUserQueryHookResult = ReturnType<typeof useSearchUserQuery>;
export type SearchUserLazyQueryHookResult = ReturnType<typeof useSearchUserLazyQuery>;
export type SearchUserQueryResult = Apollo.QueryResult<SearchUserQuery, SearchUserQueryVariables>;
export const MeDocument = gql`
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

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const ProfileDocument = gql`
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

/**
 * __useProfileQuery__
 *
 * To run a query within a React component, call `useProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useProfileQuery(baseOptions?: Apollo.QueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, options);
      }
export function useProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProfileQuery, ProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProfileQuery, ProfileQueryVariables>(ProfileDocument, options);
        }
export type ProfileQueryHookResult = ReturnType<typeof useProfileQuery>;
export type ProfileLazyQueryHookResult = ReturnType<typeof useProfileLazyQuery>;
export type ProfileQueryResult = Apollo.QueryResult<ProfileQuery, ProfileQueryVariables>;
export const LanguageDocument = gql`
    query Language {
  me {
    id
    lang
  }
}
    `;

/**
 * __useLanguageQuery__
 *
 * To run a query within a React component, call `useLanguageQuery` and pass it any options that fit your needs.
 * When your component renders, `useLanguageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLanguageQuery({
 *   variables: {
 *   },
 * });
 */
export function useLanguageQuery(baseOptions?: Apollo.QueryHookOptions<LanguageQuery, LanguageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LanguageQuery, LanguageQueryVariables>(LanguageDocument, options);
      }
export function useLanguageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LanguageQuery, LanguageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LanguageQuery, LanguageQueryVariables>(LanguageDocument, options);
        }
export type LanguageQueryHookResult = ReturnType<typeof useLanguageQuery>;
export type LanguageLazyQueryHookResult = ReturnType<typeof useLanguageLazyQuery>;
export type LanguageQueryResult = Apollo.QueryResult<LanguageQuery, LanguageQueryVariables>;
export const ThemeDocument = gql`
    query Theme {
  me {
    id
    theme
  }
}
    `;

/**
 * __useThemeQuery__
 *
 * To run a query within a React component, call `useThemeQuery` and pass it any options that fit your needs.
 * When your component renders, `useThemeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useThemeQuery({
 *   variables: {
 *   },
 * });
 */
export function useThemeQuery(baseOptions?: Apollo.QueryHookOptions<ThemeQuery, ThemeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ThemeQuery, ThemeQueryVariables>(ThemeDocument, options);
      }
export function useThemeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ThemeQuery, ThemeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ThemeQuery, ThemeQueryVariables>(ThemeDocument, options);
        }
export type ThemeQueryHookResult = ReturnType<typeof useThemeQuery>;
export type ThemeLazyQueryHookResult = ReturnType<typeof useThemeLazyQuery>;
export type ThemeQueryResult = Apollo.QueryResult<ThemeQuery, ThemeQueryVariables>;
export const UpdateMeDocument = gql`
    mutation updateMe($name: String, $email: String, $lang: Lang, $theme: Theme, $password: String, $passwordConfirmation: String) {
  updateMe(
    input: {name: $name, email: $email, lang: $lang, theme: $theme, password: $password, passwordConfirmation: $passwordConfirmation}
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
export type UpdateMeMutationFn = Apollo.MutationFunction<UpdateMeMutation, UpdateMeMutationVariables>;

/**
 * __useUpdateMeMutation__
 *
 * To run a mutation, you first call `useUpdateMeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMeMutation, { data, loading, error }] = useUpdateMeMutation({
 *   variables: {
 *      name: // value for 'name'
 *      email: // value for 'email'
 *      lang: // value for 'lang'
 *      theme: // value for 'theme'
 *      password: // value for 'password'
 *      passwordConfirmation: // value for 'passwordConfirmation'
 *   },
 * });
 */
export function useUpdateMeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMeMutation, UpdateMeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMeMutation, UpdateMeMutationVariables>(UpdateMeDocument, options);
      }
export type UpdateMeMutationHookResult = ReturnType<typeof useUpdateMeMutation>;
export type UpdateMeMutationResult = Apollo.MutationResult<UpdateMeMutation>;
export type UpdateMeMutationOptions = Apollo.BaseMutationOptions<UpdateMeMutation, UpdateMeMutationVariables>;
export const DeleteMeDocument = gql`
    mutation deleteMe($userId: ID!) {
  deleteMe(input: {userId: $userId}) {
    userId
  }
}
    `;
export type DeleteMeMutationFn = Apollo.MutationFunction<DeleteMeMutation, DeleteMeMutationVariables>;

/**
 * __useDeleteMeMutation__
 *
 * To run a mutation, you first call `useDeleteMeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMeMutation, { data, loading, error }] = useDeleteMeMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useDeleteMeMutation(baseOptions?: Apollo.MutationHookOptions<DeleteMeMutation, DeleteMeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteMeMutation, DeleteMeMutationVariables>(DeleteMeDocument, options);
      }
export type DeleteMeMutationHookResult = ReturnType<typeof useDeleteMeMutation>;
export type DeleteMeMutationResult = Apollo.MutationResult<DeleteMeMutation>;
export type DeleteMeMutationOptions = Apollo.BaseMutationOptions<DeleteMeMutation, DeleteMeMutationVariables>;
export const WorkspacesDocument = gql`
    query workspaces {
  me {
    id
    name
    myWorkspace {
      id
      ...Workspace
    }
    workspaces {
      id
      ...Workspace
    }
  }
}
    ${WorkspaceFragmentDoc}`;

/**
 * __useWorkspacesQuery__
 *
 * To run a query within a React component, call `useWorkspacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkspacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkspacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useWorkspacesQuery(baseOptions?: Apollo.QueryHookOptions<WorkspacesQuery, WorkspacesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WorkspacesQuery, WorkspacesQueryVariables>(WorkspacesDocument, options);
      }
export function useWorkspacesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WorkspacesQuery, WorkspacesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WorkspacesQuery, WorkspacesQueryVariables>(WorkspacesDocument, options);
        }
export type WorkspacesQueryHookResult = ReturnType<typeof useWorkspacesQuery>;
export type WorkspacesLazyQueryHookResult = ReturnType<typeof useWorkspacesLazyQuery>;
export type WorkspacesQueryResult = Apollo.QueryResult<WorkspacesQuery, WorkspacesQueryVariables>;
export const UpdateWorkspaceDocument = gql`
    mutation updateWorkspace($workspaceId: ID!, $name: String!) {
  updateWorkspace(input: {workspaceId: $workspaceId, name: $name}) {
    workspace {
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
      personal
    }
  }
}
    `;
export type UpdateWorkspaceMutationFn = Apollo.MutationFunction<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;

/**
 * __useUpdateWorkspaceMutation__
 *
 * To run a mutation, you first call `useUpdateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkspaceMutation, { data, loading, error }] = useUpdateWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>(UpdateWorkspaceDocument, options);
      }
export type UpdateWorkspaceMutationHookResult = ReturnType<typeof useUpdateWorkspaceMutation>;
export type UpdateWorkspaceMutationResult = Apollo.MutationResult<UpdateWorkspaceMutation>;
export type UpdateWorkspaceMutationOptions = Apollo.BaseMutationOptions<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;
export const DeleteWorkspaceDocument = gql`
    mutation deleteWorkspace($workspaceId: ID!) {
  deleteWorkspace(input: {workspaceId: $workspaceId}) {
    workspaceId
  }
}
    `;
export type DeleteWorkspaceMutationFn = Apollo.MutationFunction<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>;

/**
 * __useDeleteWorkspaceMutation__
 *
 * To run a mutation, you first call `useDeleteWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWorkspaceMutation, { data, loading, error }] = useDeleteWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useDeleteWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>(DeleteWorkspaceDocument, options);
      }
export type DeleteWorkspaceMutationHookResult = ReturnType<typeof useDeleteWorkspaceMutation>;
export type DeleteWorkspaceMutationResult = Apollo.MutationResult<DeleteWorkspaceMutation>;
export type DeleteWorkspaceMutationOptions = Apollo.BaseMutationOptions<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>;
export const AddMemberToWorkspaceDocument = gql`
    mutation addMemberToWorkspace($workspaceId: ID!, $userId: ID!, $role: Role!) {
  addMemberToWorkspace(
    input: {workspaceId: $workspaceId, userId: $userId, role: $role}
  ) {
    workspace {
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
      personal
    }
  }
}
    `;
export type AddMemberToWorkspaceMutationFn = Apollo.MutationFunction<AddMemberToWorkspaceMutation, AddMemberToWorkspaceMutationVariables>;

/**
 * __useAddMemberToWorkspaceMutation__
 *
 * To run a mutation, you first call `useAddMemberToWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMemberToWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMemberToWorkspaceMutation, { data, loading, error }] = useAddMemberToWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userId: // value for 'userId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useAddMemberToWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<AddMemberToWorkspaceMutation, AddMemberToWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddMemberToWorkspaceMutation, AddMemberToWorkspaceMutationVariables>(AddMemberToWorkspaceDocument, options);
      }
export type AddMemberToWorkspaceMutationHookResult = ReturnType<typeof useAddMemberToWorkspaceMutation>;
export type AddMemberToWorkspaceMutationResult = Apollo.MutationResult<AddMemberToWorkspaceMutation>;
export type AddMemberToWorkspaceMutationOptions = Apollo.BaseMutationOptions<AddMemberToWorkspaceMutation, AddMemberToWorkspaceMutationVariables>;
export const UpdateMemberOfWorkspaceDocument = gql`
    mutation updateMemberOfWorkspace($workspaceId: ID!, $userId: ID!, $role: Role!) {
  updateMemberOfWorkspace(
    input: {workspaceId: $workspaceId, userId: $userId, role: $role}
  ) {
    workspace {
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
      personal
    }
  }
}
    `;
export type UpdateMemberOfWorkspaceMutationFn = Apollo.MutationFunction<UpdateMemberOfWorkspaceMutation, UpdateMemberOfWorkspaceMutationVariables>;

/**
 * __useUpdateMemberOfWorkspaceMutation__
 *
 * To run a mutation, you first call `useUpdateMemberOfWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMemberOfWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMemberOfWorkspaceMutation, { data, loading, error }] = useUpdateMemberOfWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userId: // value for 'userId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useUpdateMemberOfWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMemberOfWorkspaceMutation, UpdateMemberOfWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMemberOfWorkspaceMutation, UpdateMemberOfWorkspaceMutationVariables>(UpdateMemberOfWorkspaceDocument, options);
      }
export type UpdateMemberOfWorkspaceMutationHookResult = ReturnType<typeof useUpdateMemberOfWorkspaceMutation>;
export type UpdateMemberOfWorkspaceMutationResult = Apollo.MutationResult<UpdateMemberOfWorkspaceMutation>;
export type UpdateMemberOfWorkspaceMutationOptions = Apollo.BaseMutationOptions<UpdateMemberOfWorkspaceMutation, UpdateMemberOfWorkspaceMutationVariables>;
export const RemoveMemberFromWorkspaceDocument = gql`
    mutation removeMemberFromWorkspace($workspaceId: ID!, $userId: ID!) {
  removeMemberFromWorkspace(input: {workspaceId: $workspaceId, userId: $userId}) {
    workspace {
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
      personal
    }
  }
}
    `;
export type RemoveMemberFromWorkspaceMutationFn = Apollo.MutationFunction<RemoveMemberFromWorkspaceMutation, RemoveMemberFromWorkspaceMutationVariables>;

/**
 * __useRemoveMemberFromWorkspaceMutation__
 *
 * To run a mutation, you first call `useRemoveMemberFromWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMemberFromWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMemberFromWorkspaceMutation, { data, loading, error }] = useRemoveMemberFromWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useRemoveMemberFromWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMemberFromWorkspaceMutation, RemoveMemberFromWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMemberFromWorkspaceMutation, RemoveMemberFromWorkspaceMutationVariables>(RemoveMemberFromWorkspaceDocument, options);
      }
export type RemoveMemberFromWorkspaceMutationHookResult = ReturnType<typeof useRemoveMemberFromWorkspaceMutation>;
export type RemoveMemberFromWorkspaceMutationResult = Apollo.MutationResult<RemoveMemberFromWorkspaceMutation>;
export type RemoveMemberFromWorkspaceMutationOptions = Apollo.BaseMutationOptions<RemoveMemberFromWorkspaceMutation, RemoveMemberFromWorkspaceMutationVariables>;
export const CreateWorkspaceDocument = gql`
    mutation createWorkspace($name: String!) {
  createWorkspace(input: {name: $name}) {
    workspace {
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
      personal
    }
  }
}
    `;
export type CreateWorkspaceMutationFn = Apollo.MutationFunction<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;

/**
 * __useCreateWorkspaceMutation__
 *
 * To run a mutation, you first call `useCreateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkspaceMutation, { data, loading, error }] = useCreateWorkspaceMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>(CreateWorkspaceDocument, options);
      }
export type CreateWorkspaceMutationHookResult = ReturnType<typeof useCreateWorkspaceMutation>;
export type CreateWorkspaceMutationResult = Apollo.MutationResult<CreateWorkspaceMutation>;
export type CreateWorkspaceMutationOptions = Apollo.BaseMutationOptions<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;