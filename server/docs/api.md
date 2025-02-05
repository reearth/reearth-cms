# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [proto/v1/internal_api.proto](#proto_v1_internal_api-proto)
    - [AuthRequest](#reearth-cms-v1-AuthRequest)
    - [AuthResponse](#reearth-cms-v1-AuthResponse)
    - [ExportRequest](#reearth-cms-v1-ExportRequest)
    - [ExportURLResponse](#reearth-cms-v1-ExportURLResponse)
    - [ListModelsRequest](#reearth-cms-v1-ListModelsRequest)
    - [ListModelsResponse](#reearth-cms-v1-ListModelsResponse)
    - [ListProjectsRequest](#reearth-cms-v1-ListProjectsRequest)
    - [ListProjectsResponse](#reearth-cms-v1-ListProjectsResponse)
    - [Model](#reearth-cms-v1-Model)
    - [Project](#reearth-cms-v1-Project)
    - [ProjectPublication](#reearth-cms-v1-ProjectPublication)
    - [RefreshTokenRequest](#reearth-cms-v1-RefreshTokenRequest)
  
    - [ProjectPublicationScope](#reearth-cms-v1-ProjectPublicationScope)
  
    - [ReEarthCMS](#reearth-cms-v1-ReEarthCMS)
  
- [Scalar Value Types](#scalar-value-types)



<a name="proto_v1_internal_api-proto"></a>
<p align="right"><a href="#top">Top</a></p>

## proto/v1/internal_api.proto



<a name="reearth-cms-v1-AuthRequest"></a>

### AuthRequest
Auth messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| api_key | [string](#string) |  |  |






<a name="reearth-cms-v1-AuthResponse"></a>

### AuthResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| access_token | [string](#string) |  |  |
| refresh_token | [string](#string) |  |  |
| expires_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |






<a name="reearth-cms-v1-ExportRequest"></a>

### ExportRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) |  |  |
| model_id | [string](#string) |  |  |
| expires_in_seconds | [int32](#int32) |  |  |






<a name="reearth-cms-v1-ExportURLResponse"></a>

### ExportURLResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| url | [string](#string) |  |  |
| expires_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |






<a name="reearth-cms-v1-ListModelsRequest"></a>

### ListModelsRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| project_id | [string](#string) |  |  |
| page_size | [int32](#int32) |  |  |
| page_token | [string](#string) |  |  |






<a name="reearth-cms-v1-ListModelsResponse"></a>

### ListModelsResponse



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| models | [Model](#reearth-cms-v1-Model) | repeated |  |
| next_page_token | [string](#string) |  |  |
| total_count | [int32](#int32) |  |  |






<a name="reearth-cms-v1-ListProjectsRequest"></a>

### ListProjectsRequest
Request messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| workspace_id | [string](#string) |  |  |
| page_size | [int32](#int32) |  |  |
| page_token | [string](#string) |  |  |






<a name="reearth-cms-v1-ListProjectsResponse"></a>

### ListProjectsResponse
Response messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| projects | [Project](#reearth-cms-v1-Project) | repeated |  |
| next_page_token | [string](#string) |  |  |
| total_count | [int32](#int32) |  |  |






<a name="reearth-cms-v1-Model"></a>

### Model



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| project_id | [string](#string) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) |  |  |
| key | [string](#string) |  |  |
| public | [bool](#bool) |  |  |
| created_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| updated_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |






<a name="reearth-cms-v1-Project"></a>

### Project
Core messages


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  |  |
| name | [string](#string) |  |  |
| description | [string](#string) |  |  |
| workspace_id | [string](#string) |  |  |
| publication | [ProjectPublication](#reearth-cms-v1-ProjectPublication) |  |  |
| created_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |
| updated_at | [google.protobuf.Timestamp](#google-protobuf-Timestamp) |  |  |






<a name="reearth-cms-v1-ProjectPublication"></a>

### ProjectPublication



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| scope | [ProjectPublicationScope](#reearth-cms-v1-ProjectPublicationScope) |  |  |
| asset_public | [bool](#bool) |  |  |
| token | [string](#string) | optional |  |






<a name="reearth-cms-v1-RefreshTokenRequest"></a>

### RefreshTokenRequest



| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| refresh_token | [string](#string) |  |  |





 


<a name="reearth-cms-v1-ProjectPublicationScope"></a>

### ProjectPublicationScope


| Name | Number | Description |
| ---- | ------ | ----------- |
| SCOPE_UNSPECIFIED | 0 |  |
| PUBLIC | 1 |  |
| LIMITED | 2 |  |
| PRIVATE | 3 |  |


 

 


<a name="reearth-cms-v1-ReEarthCMS"></a>

### ReEarthCMS


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| Authenticate | [AuthRequest](#reearth-cms-v1-AuthRequest) | [AuthResponse](#reearth-cms-v1-AuthResponse) | Auth |
| RefreshToken | [RefreshTokenRequest](#reearth-cms-v1-RefreshTokenRequest) | [AuthResponse](#reearth-cms-v1-AuthResponse) |  |
| ListProjects | [ListProjectsRequest](#reearth-cms-v1-ListProjectsRequest) | [ListProjectsResponse](#reearth-cms-v1-ListProjectsResponse) | Main operations |
| ListModels | [ListModelsRequest](#reearth-cms-v1-ListModelsRequest) | [ListModelsResponse](#reearth-cms-v1-ListModelsResponse) |  |
| GetModelGeoJSONExportURL | [ExportRequest](#reearth-cms-v1-ExportRequest) | [ExportURLResponse](#reearth-cms-v1-ExportURLResponse) |  |

 



## Scalar Value Types

| .proto Type | Notes | C++ | Java | Python | Go | C# | PHP | Ruby |
| ----------- | ----- | --- | ---- | ------ | -- | -- | --- | ---- |
| <a name="double" /> double |  | double | double | float | float64 | double | float | Float |
| <a name="float" /> float |  | float | float | float | float32 | float | float | Float |
| <a name="int32" /> int32 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint32 instead. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="int64" /> int64 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint64 instead. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="uint32" /> uint32 | Uses variable-length encoding. | uint32 | int | int/long | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="uint64" /> uint64 | Uses variable-length encoding. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum or Fixnum (as required) |
| <a name="sint32" /> sint32 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int32s. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sint64" /> sint64 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int64s. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="fixed32" /> fixed32 | Always four bytes. More efficient than uint32 if values are often greater than 2^28. | uint32 | int | int | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="fixed64" /> fixed64 | Always eight bytes. More efficient than uint64 if values are often greater than 2^56. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum |
| <a name="sfixed32" /> sfixed32 | Always four bytes. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sfixed64" /> sfixed64 | Always eight bytes. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="bool" /> bool |  | bool | boolean | boolean | bool | bool | boolean | TrueClass/FalseClass |
| <a name="string" /> string | A string must always contain UTF-8 encoded or 7-bit ASCII text. | string | String | str/unicode | string | string | string | String (UTF-8) |
| <a name="bytes" /> bytes | May contain any arbitrary sequence of bytes. | string | ByteString | str | []byte | ByteString | string | String (ASCII-8BIT) |

