package e2e

import (
	"context"
	"errors"
	"net"
	"net/http"
	"os"
	"strings"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/account"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mailer"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"google.golang.org/grpc"
)

type Seeder func(context.Context, *repo.Container, *gateway.Container) error

// setupTestAccountsAPI configures a test accounts API instance for e2e testing
func setupTestAccountsAPI(t *testing.T, cfg *app.Config) {
	t.Helper()

	testAccountsAPIHost := os.Getenv("REEARTH_ACCOUNTS_API_HOST")
	if testAccountsAPIHost == "" {
		// Check if default Docker service is available
		testAccountsAPIHost = "http://localhost:8099/graphql"
		t.Logf("REEARTH_ACCOUNTS_API_HOST not set, using default: %s", testAccountsAPIHost)

		// Quick health check - if accounts API is not available, disable it for tests
		if !isAccountsAPIAvailable(testAccountsAPIHost) {
			t.Logf("Accounts API not available at %s, disabling for tests", testAccountsAPIHost)
			cfg.Account_Api = app.AccountAPIConfig{Enabled: false}
			return
		}
	}

	cfg.Account_Api = app.AccountAPIConfig{
		Enabled: true,
		Host:    testAccountsAPIHost,
		Timeout: 30, // Longer timeout for Docker startup
	}

	t.Logf("Test accounts API configured: %s", testAccountsAPIHost)
}

// isAccountsAPIAvailable checks if the accounts API is reachable
func isAccountsAPIAvailable(host string) bool {
	// Quick HTTP check to see if the service is running
	// We'll check the health endpoint or just try to connect
	resp, err := http.Get(strings.Replace(host, "/graphql", "/health", 1))
	if err != nil {
		return false
	}
	defer func() {
		_ = resp.Body.Close()
	}()
	return resp.StatusCode < 500
}

func init() {
	mongotest.Env = "REEARTH_CMS_DB"
}

func startServer(t *testing.T, cfg *app.Config, repos *repo.Container, accountrepos *accountrepo.Container, gateway *gateway.Container, accountgateway *accountgateway.Container) *httpexpect.Expect {
	t.Helper()

	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	ctx := context.Background()

	cfg.Server.Active = true
	srv := app.NewServer(ctx, &app.ApplicationContext{
		Config:     cfg,
		Repos:      repos,
		AcRepos:    accountrepos,
		Gateways:   gateway,
		AcGateways: accountgateway,
		Debug:      true,
	})

	l1, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("http server failed to listen: %v", err)
	}

	ch1 := make(chan error)
	go func() {
		if err := srv.HttpServe(l1); !errors.Is(err, http.ErrServerClosed) {
			ch1 <- err
		}
		close(ch1)
	}()

	t.Cleanup(func() {
		if err := srv.HttpShutdown(context.Background()); err != nil {
			t.Fatalf("server shutdown: %v", err)
		}

		if err := <-ch1; err != nil {
			t.Fatalf("http server serve: %v", err)
		}
	})

	if cfg.InternalApi.Active {
		l2, err := net.Listen("tcp", ":"+cfg.InternalApi.Port)
		if err != nil {
			t.Fatalf("grpc server failed to listen: %v", err)
		}

		ch2 := make(chan error)
		go func() {
			if err := srv.GrpcServe(l2); !errors.Is(err, grpc.ErrServerStopped) {
				ch2 <- err
			}
			close(ch2)
		}()

		t.Cleanup(func() {
			if err := srv.GrpcShutdown(context.Background()); err != nil {
				t.Fatalf("server shutdown: %v", err)
			}

			if err := <-ch2; err != nil {
				t.Fatalf("grpc server serve: %v", err)
			}
		})
	}

	return httpexpect.Default(t, "http://"+l1.Addr().String())
}

func StartServerWithRepos(t *testing.T, cfg *app.Config, useMongo bool, seeder Seeder) (*httpexpect.Expect, *repo.Container, *accountrepo.Container) {
	t.Helper()

	ctx := context.Background()

	var repos *repo.Container
	var accountRepos *accountrepo.Container
	if useMongo {
		db := mongotest.Connect(t)(t)
		log.Infof("test: new db created with name: %v", db.Name())
		accountRepos = lo.Must(accountmongo.New(ctx, db.Client(), db.Name(), false, false, nil))
		repos = lo.Must(mongo.NewWithDB(ctx, db, false, accountRepos))
	} else {
		repos = memory.New()
		accountRepos = accountmemory.New()
	}

	if cfg.AssetBaseURL == "" {
		cfg.AssetBaseURL = "https://example.com"
	}
	if cfg.Host == "" {
		cfg.Host = "https://example.com"
	}

	f := lo.Must(fs.NewFile(afero.NewMemMapFs(), cfg.AssetBaseURL, cfg.AssetUploadURLReplacement))
	if !cfg.Asset_Public {
		f = lo.Must(fs.NewFileWithACL(afero.NewMemMapFs(), cfg.AssetBaseURL, cfg.Host, cfg.AssetUploadURLReplacement))
	}

	// Configure test accounts API
	setupTestAccountsAPI(t, cfg)

	// Create gateway container and initialize Accounts if configured
	gateway := &gateway.Container{File: f}

	// Initialize Accounts client if enabled
	if cfg.Account_Api.Enabled && cfg.Account_Api.Host != "" {
		timeout := cfg.Account_Api.Timeout
		if timeout == 0 {
			timeout = 30 // Default 30 seconds
		}
		transport := app.NewDynamicAuthTransport()
		gateway.Accounts = account.New(cfg.Account_Api.Host, timeout, transport)
		t.Logf("Test Accounts client created: %s (timeout: %ds)", cfg.Account_Api.Host, timeout)
	} else {
		t.Log("Accounts not configured for tests")
	}
	accountGateways := &accountgateway.Container{
		Mailer: mailer.New(ctx, &mailer.Config{}),
	}

	if seeder != nil {
		if err := seeder(ctx, repos, gateway); err != nil {
			t.Fatalf("failed to seed the db: %s", err)
		}
	}

	return startServer(t, cfg, repos, accountRepos, gateway, accountGateways), repos, accountRepos
}

func StartServer(t *testing.T, cfg *app.Config, useMongo bool, seeder Seeder) *httpexpect.Expect {
	e, _, _ := StartServerWithRepos(t, cfg, useMongo, seeder)
	return e
}

type GraphQLRequest struct {
	Query     string         `json:"query"`
	Variables map[string]any `json:"variables"`
}
