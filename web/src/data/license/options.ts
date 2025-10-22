export type LicenseOption = {
  value: string;
  label: string;
  description: string;
};

export const license_options: LicenseOption[] = [
  {
    value: "o-uda-1.0",
    label: "Open Use of Data Agreement v1.0",
    description:
      "A permissive data license that allows unrestricted use, modification, and distribution of data with minimal obligations. Only requires attribution preservation and warranty disclaimers for redistributed data.",
  },
  {
    value: "eupl-1.2",
    label: "European Union Public License v1.2",
    description:
      "A copyleft license created by the European Commission, available in 23 EU languages. Compatible with several other open source licenses and provides patent grants. Ensures derivatives remain under EUPL or compatible licenses.",
  },
  {
    value: "lgpl-3.0",
    label: "GNU Lesser General Public License v3.0",
    description:
      "A weak copyleft license primarily for software libraries. Allows linking with proprietary software while ensuring modifications to the library itself remain open source. Includes explicit patent grants.",
  },
  {
    value: "gpl-3.0",
    label: "GNU General Public License v3.0",
    description:
      "Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved.",
  },
  {
    value: "apache-2.0",
    label: "Apache License 2.0",
    description:
      "A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.",
  },
  {
    value: "mit",
    label: "MIT License",
    description:
      "A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.",
  },
  {
    value: "cc-by-nc-4.0",
    label: "Creative Commons Attribution-NonCommercial 4.0 International",
    description:
      "Allows redistribution and creation of derivatives for non-commercial purposes only. Requires attribution to the original creator. Commercial use is prohibited.",
  },
  {
    value: "cc-by-sa-4.0",
    label: "Creative Commons Attribution-ShareAlike 4.0 International",
    description:
      "Allows redistribution and creation of derivatives for any purpose, including commercially, as long as attribution is given and derivatives are licensed under identical terms (copyleft).",
  },
  {
    value: "cc-by-4.0",
    label: "Creative Commons Attribution 4.0 International",
    description:
      "The most permissive Creative Commons license. Allows redistribution and creation of derivatives for any purpose, including commercially, as long as attribution is given to the creator.",
  },
];
