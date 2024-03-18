import { gql } from "@apollo/client";

export const assetFileFragment = gql`
  fragment assetFileFragment on AssetFile {
    name
    size
    contentType
    path
    filePaths
  }
`;

export default assetFileFragment;
