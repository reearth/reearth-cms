import { useCallback, useState } from "react";

import useHooks from "./hooks";

export type Props = {};

const Account: React.FC<Props> = () => {
  const { me, updateName } = useHooks();

  const [filterText, setFilterText] = useState("");
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterText?.(e.currentTarget.value);
    },
    [setFilterText]
  );

  const handleClick = useCallback(() => {
    updateName(filterText);
  }, [filterText, updateName]);

  return (
    <>
      <h2>Name: {me?.name}</h2>
      <input value={filterText} onChange={handleInputChange} type="text" />
      <button onClick={handleClick}>Update name</button>
    </>
  );
};

export default Account;
