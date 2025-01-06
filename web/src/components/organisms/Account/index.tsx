import AccountSettingsMolecule from "@reearth-cms/components/molecules/AccountSettings";

import useHooks from "./hooks";

const AccountSettings: React.FC = () => {
  const { me, loading, handleUserUpdate, handleLanguageUpdate, handleUserDelete } = useHooks();

  return (
    <AccountSettingsMolecule
      me={me}
      loading={loading}
      onUserUpdate={handleUserUpdate}
      onLanguageUpdate={handleLanguageUpdate}
      onUserDelete={handleUserDelete}
    />
  );
};

export default AccountSettings;
