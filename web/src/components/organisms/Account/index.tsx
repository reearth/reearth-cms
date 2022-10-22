import AccountSettingsMolecule from "@reearth-cms/components/molecules/AccountSettings";

import useHooks from "./hooks";

const AccountSettings: React.FC = () => {
  const { handleUserUpdate, handleLanguageUpdate, handleUserDelete, me } = useHooks();

  return (
    <AccountSettingsMolecule
      user={me}
      onUserUpdate={handleUserUpdate}
      onLanguageUpdate={handleLanguageUpdate}
      onUserDelete={handleUserDelete}
    />
  );
};

export default AccountSettings;
