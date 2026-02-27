import AccountSettingsWrapper from "@reearth-cms/components/molecules/AccountSettings";

import useHooks from "./hooks";

const AccountSettings: React.FC = () => {
  const { handleLanguageUpdate, handleUserDelete, handleUserUpdate, loading, me } = useHooks();

  return (
    <AccountSettingsWrapper
      loading={loading}
      me={me}
      onLanguageUpdate={handleLanguageUpdate}
      onUserDelete={handleUserDelete}
      onUserUpdate={handleUserUpdate}
    />
  );
};

export default AccountSettings;
