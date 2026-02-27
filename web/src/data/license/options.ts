export type LicenseOption = {
  description: string;
  label: string;
  value: string;
};

export const license_options: LicenseOption[] = [
  {
    description:
      "A permissive data license that allows unrestricted use, modification, and distribution of data with minimal obligations. Only requires attribution preservation and warranty disclaimers for redistributed data.",
    label: "Open Use of Data Agreement v1.0",
    value: "o-uda-1.0",
  },
  {
    description:
      "A copyleft license created by the European Commission, available in 23 EU languages. Compatible with several other open source licenses and provides patent grants. Ensures derivatives remain under EUPL or compatible licenses.",
    label: "European Union Public License v1.2",
    value: "eupl-1.2",
  },
  {
    description:
      "A weak copyleft license primarily for software libraries. Allows linking with proprietary software while ensuring modifications to the library itself remain open source. Includes explicit patent grants.",
    label: "GNU Lesser General Public License v3.0",
    value: "lgpl-3.0",
  },
  {
    description:
      "Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved.",
    label: "GNU General Public License v3.0",
    value: "gpl-3.0",
  },
  {
    description:
      "A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.",
    label: "Apache License 2.0",
    value: "apache-2.0",
  },
  {
    description:
      "A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.",
    label: "MIT License",
    value: "mit",
  },
  {
    description:
      "Allows redistribution and creation of derivatives for non-commercial purposes only. Requires attribution to the original creator. Commercial use is prohibited.",
    label: "Creative Commons Attribution-NonCommercial 4.0 International",
    value: "cc-by-nc-4.0",
  },
  {
    description:
      "Allows redistribution and creation of derivatives for any purpose, including commercially, as long as attribution is given and derivatives are licensed under identical terms (copyleft).",
    label: "Creative Commons Attribution-ShareAlike 4.0 International",
    value: "cc-by-sa-4.0",
  },
  {
    description:
      "The most permissive Creative Commons license. Allows redistribution and creation of derivatives for any purpose, including commercially, as long as attribution is given to the creator.",
    label: "Creative Commons Attribution 4.0 International",
    value: "cc-by-4.0",
  },
];
