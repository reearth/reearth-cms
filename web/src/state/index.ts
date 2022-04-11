import { atom, useAtom } from "jotai";

// useError is needed for Apollo provider error only.
const error = atom<string | undefined>(undefined);
export const useError = () => useAtom(error);
