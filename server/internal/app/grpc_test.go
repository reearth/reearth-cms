package app

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

func Test_isReadOnlyMethod(t *testing.T) {
	t.Run("read-only methods", func(t *testing.T) {
		t.Run("GetProject method should be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/GetProject")
			assert.True(t, result)
		})

		t.Run("ListProjects method should be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/ListProjects")
			assert.True(t, result)
		})

		t.Run("ListModels method should be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/ListModels")
			assert.True(t, result)
		})

		t.Run("ListItems method should be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/ListItems")
			assert.True(t, result)
		})
	})

	t.Run("write methods", func(t *testing.T) {
		t.Run("CreateProject method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/CreateProject")
			assert.False(t, result)
		})

		t.Run("UpdateProject method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/UpdateProject")
			assert.False(t, result)
		})

		t.Run("DeleteProject method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/DeleteProject")
			assert.False(t, result)
		})

		t.Run("CreateModel method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/CreateModel")
			assert.False(t, result)
		})

		t.Run("UpdateModel method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/UpdateModel")
			assert.False(t, result)
		})

		t.Run("DeleteModel method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/DeleteModel")
			assert.False(t, result)
		})

		t.Run("CreateItem method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/CreateItem")
			assert.False(t, result)
		})

		t.Run("UpdateItem method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/UpdateItem")
			assert.False(t, result)
		})

		t.Run("DeleteItem method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.ReEarthCMS/DeleteItem")
			assert.False(t, result)
		})
	})

	t.Run("edge cases", func(t *testing.T) {
		t.Run("random method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("/v1.SomeOtherService/RandomMethod")
			assert.False(t, result)
		})

		t.Run("empty method should not be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("")
			assert.False(t, result)
		})
	})

	t.Run("partial matches", func(t *testing.T) {
		t.Run("partial match GetProject should be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("grpc.service.v1.ReEarthCMS/GetProject")
			assert.True(t, result)
		})

		t.Run("partial match ListProjects should be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("grpc.service.v1.ReEarthCMS/ListProjects")
			assert.True(t, result)
		})

		t.Run("partial match ListModels should be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("grpc.service.v1.ReEarthCMS/ListModels")
			assert.True(t, result)
		})

		t.Run("partial match ListItems should be read-only", func(t *testing.T) {
			result := isReadOnlyMethod("grpc.service.v1.ReEarthCMS/ListItems")
			assert.True(t, result)
		})
	})
}

func Test_unaryAuthInterceptor_ReadOnlyMethods(t *testing.T) {
	// Mock application context
	appCtx := &ApplicationContext{
		Config: &Config{
			InternalApi: InternalApiConfig{
				Token: "valid-token",
			},
		},
	}

	// Create interceptor
	interceptor := unaryAuthInterceptor(appCtx)

	t.Run("read-only methods bypass auth", func(t *testing.T) {
		t.Run("GetProject should bypass auth", func(t *testing.T) {
			ctx := context.Background()
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/GetProject",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.True(t, handlerCalled)
			assert.NoError(t, err)
			assert.NotNil(t, result)
		})

		t.Run("ListProjects should bypass auth", func(t *testing.T) {
			ctx := context.Background()
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/ListProjects",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.True(t, handlerCalled)
			assert.NoError(t, err)
			assert.NotNil(t, result)
		})

		t.Run("ListModels should bypass auth", func(t *testing.T) {
			ctx := context.Background()
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/ListModels",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.True(t, handlerCalled)
			assert.NoError(t, err)
			assert.NotNil(t, result)
		})

		t.Run("ListItems should bypass auth", func(t *testing.T) {
			ctx := context.Background()
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/ListItems",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.True(t, handlerCalled)
			assert.NoError(t, err)
			assert.NotNil(t, result)
		})
	})

	t.Run("write methods require auth", func(t *testing.T) {
		t.Run("write method without metadata should fail", func(t *testing.T) {
			ctx := context.Background()
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/CreateProject",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.False(t, handlerCalled)
			assert.Error(t, err)
			assert.Nil(t, result)
		})

		t.Run("write method with valid token should succeed", func(t *testing.T) {
			md := metadata.New(map[string]string{})
			md.Set("authorization", "Bearer valid-token")
			ctx := metadata.NewIncomingContext(context.Background(), md)
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/CreateProject",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.True(t, handlerCalled)
			assert.NoError(t, err)
			assert.NotNil(t, result)
		})

		t.Run("write method with invalid token should fail", func(t *testing.T) {
			md := metadata.New(map[string]string{})
			md.Set("authorization", "Bearer invalid-token")
			ctx := metadata.NewIncomingContext(context.Background(), md)
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/CreateProject",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.False(t, handlerCalled)
			assert.Error(t, err)
			assert.Nil(t, result)
		})
	})
}

func Test_unaryAttachOperatorInterceptor_ReadOnlyMethods(t *testing.T) {
	// Mock application context - set to nil to avoid database dependencies
	appCtx := &ApplicationContext{}

	// Create interceptor
	interceptor := unaryAttachOperatorInterceptor(appCtx)

	t.Run("read-only methods bypass operator check", func(t *testing.T) {
		t.Run("GetProject should bypass operator check", func(t *testing.T) {
			ctx := context.Background()
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/GetProject",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.True(t, handlerCalled)
			assert.NoError(t, err)
			assert.NotNil(t, result)
		})

		t.Run("ListProjects should bypass operator check", func(t *testing.T) {
			ctx := context.Background()
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/ListProjects",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.True(t, handlerCalled)
			assert.NoError(t, err)
			assert.NotNil(t, result)
		})

		t.Run("ListModels should bypass operator check", func(t *testing.T) {
			ctx := context.Background()
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/ListModels",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.True(t, handlerCalled)
			assert.NoError(t, err)
			assert.NotNil(t, result)
		})

		t.Run("ListItems should bypass operator check", func(t *testing.T) {
			ctx := context.Background()
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/ListItems",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.True(t, handlerCalled)
			assert.NoError(t, err)
			assert.NotNil(t, result)
		})
	})

	t.Run("write methods require metadata", func(t *testing.T) {
		t.Run("write method without metadata should fail", func(t *testing.T) {
			ctx := context.Background()
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/CreateProject",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.False(t, handlerCalled)
			assert.Error(t, err)
			assert.Nil(t, result)
		})

		t.Run("write method with metadata but no user-id should fail", func(t *testing.T) {
			md := metadata.New(map[string]string{})
			ctx := metadata.NewIncomingContext(context.Background(), md)
			
			handlerCalled := false
			handler := func(ctx context.Context, req any) (any, error) {
				handlerCalled = true
				return "success", nil
			}

			info := &grpc.UnaryServerInfo{
				FullMethod: "/v1.ReEarthCMS/CreateProject",
			}

			result, err := interceptor(ctx, "test-request", info, handler)

			assert.False(t, handlerCalled)
			assert.Error(t, err)
			assert.Nil(t, result)
		})
	})
}