// import { gql } from "@apollo/client";

// export const CREATE_WEBHOOK = gql`
//   mutation CreateWebhook(
//     $integrationId: ID!
//     $name: String!
//     $url: URL!
//     $active: Boolean!
//     $trigger: WebhookTriggerInput!
//   ) {
//     createWebhook(
//       input: {
//         integrationId: $integrationId
//         name: $name
//         url: $url
//         active: $active
//         trigger: $trigger
//       }
//     ) {
//       webhook {
//         id
//         name
//         url
//         active
//         trigger {
//           onItemCreate
//           onItemUpdate
//           onItemDelete
//           onItemPublish
//           onItemUnPublish
//           onAssetUpload
//           onAssetDeleted
//         }
//         createdAt
//         updatedAt
//       }
//     }
//   }
// `;
