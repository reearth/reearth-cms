import { license_content } from "./content";

export type LicenseWithContent = {
  value: string;
  label: string;
  description: string;
  content: string;
};

export const getLicenseContent = (value: string): string | null => {
  return license_content[value as keyof typeof license_content] || null;
};
