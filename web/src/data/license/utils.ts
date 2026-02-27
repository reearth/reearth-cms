import { license_content } from "./content";

export type LicenseWithContent = {
  content: string;
  description: string;
  label: string;
  value: string;
};

export const getLicenseContent = (value: string): null | string => {
  return license_content[value as keyof typeof license_content] || null;
};
