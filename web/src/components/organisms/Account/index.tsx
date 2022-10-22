import AccountSettingsMolecule from "@reearth-cms/components/molecules/AccountSettings";

import useHooks from "./hooks";

const AccountSettings: React.FC = () => {
  const { handleUserUpdate, handleLanguageUpdate, handleUserDelete } = useHooks();

  return (
    <AccountSettingsMolecule
      onUserUpdate={handleUserUpdate}
      onLanguageUpdate={handleLanguageUpdate}
      onUserDelete={handleUserDelete}
    />
  );
};

export default AccountSettings;
