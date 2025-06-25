package workspace

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func setupTestConfig() SubscriptionLimitConfig {
	return SubscriptionLimitConfig{
		Enabled: true,
		Free: PlanLimitConfig{
			ProjectLimit:         1,
			ModelPerProjectLimit: 3,
			ItemPerModelLimit:    100,
			IntegrationLimit:     1,
		},
		Starter: PlanLimitConfig{
			ProjectLimit:         3,
			ModelPerProjectLimit: 10,
			ItemPerModelLimit:    1000,
			IntegrationLimit:     3,
		},
		Business: PlanLimitConfig{
			ProjectLimit:         10,
			ModelPerProjectLimit: 50,
			ItemPerModelLimit:    10000,
			IntegrationLimit:     10,
		},
		Advanced: PlanLimitConfig{
			ProjectLimit:         50,
			ModelPerProjectLimit: 200,
			ItemPerModelLimit:    100000,
			IntegrationLimit:     50,
		},
		Enterprise: PlanLimitConfig{
			ProjectLimit:         -1,
			ModelPerProjectLimit: -1,
			ItemPerModelLimit:    -1,
			IntegrationLimit:     -1,
		},
	}
}

func TestGetPlanLimits(t *testing.T) {
	SetSubscriptionConfig(setupTestConfig())

	tests := []struct {
		name     string
		plan     PlanType
		expected PlanLimitConfig
	}{
		{
			name: "free plan",
			plan: PlanFree,
			expected: PlanLimitConfig{
				ProjectLimit:         1,
				ModelPerProjectLimit: 3,
				ItemPerModelLimit:    100,
				IntegrationLimit:     1,
			},
		},
		{
			name: "starter plan",
			plan: PlanStarter,
			expected: PlanLimitConfig{
				ProjectLimit:         3,
				ModelPerProjectLimit: 10,
				ItemPerModelLimit:    1000,
				IntegrationLimit:     3,
			},
		},
		{
			name: "business plan",
			plan: PlanBusiness,
			expected: PlanLimitConfig{
				ProjectLimit:         10,
				ModelPerProjectLimit: 50,
				ItemPerModelLimit:    10000,
				IntegrationLimit:     10,
			},
		},
		{
			name: "advanced plan",
			plan: PlanAdvanced,
			expected: PlanLimitConfig{
				ProjectLimit:         50,
				ModelPerProjectLimit: 200,
				ItemPerModelLimit:    100000,
				IntegrationLimit:     50,
			},
		},
		{
			name: "enterprise plan",
			plan: PlanEnterprise,
			expected: PlanLimitConfig{
				ProjectLimit:         -1,
				ModelPerProjectLimit: -1,
				ItemPerModelLimit:    -1,
				IntegrationLimit:     -1,
			},
		},
		{
			name: "unknown plan defaults to free",
			plan: PlanType("unknown"),
			expected: PlanLimitConfig{
				ProjectLimit:         1,
				ModelPerProjectLimit: 3,
				ItemPerModelLimit:    100,
				IntegrationLimit:     1,
			},
		},
	}

	for _, tt := range tests {
		tt := tt // capture range variable
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			limits := GetPlanLimits(tt.plan)
			assert.Equal(t, tt.expected, limits)
		})
	}
}

func TestValidateProjectLimit(t *testing.T) {

	SetSubscriptionConfig(setupTestConfig())

	tests := []struct {
		name         string
		plan         PlanType
		currentCount int
		wantError    bool
		expectedErr  error
	}{
		{
			name:         "free plan - within limit",
			plan:         PlanFree,
			currentCount: 0,
			wantError:    false,
		},
		{
			name:         "free plan - at limit",
			plan:         PlanFree,
			currentCount: 1,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "free plan - over limit",
			plan:         PlanFree,
			currentCount: 2,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "starter plan - within limit",
			plan:         PlanStarter,
			currentCount: 2,
			wantError:    false,
		},
		{
			name:         "starter plan - at limit",
			plan:         PlanStarter,
			currentCount: 3,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "enterprise plan - unlimited",
			plan:         PlanEnterprise,
			currentCount: 999999,
			wantError:    false,
		},
	}

	for _, tt := range tests {
		tt := tt // capture range variable
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := ValidateProjectLimit(tt.plan, tt.currentCount)
			if tt.wantError {
				assert.Error(t, err)
				if tt.expectedErr != nil {
					assert.ErrorIs(t, err, tt.expectedErr)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestValidateModelLimit(t *testing.T) {

	SetSubscriptionConfig(setupTestConfig())

	tests := []struct {
		name         string
		plan         PlanType
		currentCount int
		wantError    bool
		expectedErr  error
	}{
		{
			name:         "free plan - within limit",
			plan:         PlanFree,
			currentCount: 2,
			wantError:    false,
		},
		{
			name:         "free plan - at limit",
			plan:         PlanFree,
			currentCount: 3,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "starter plan - within limit",
			plan:         PlanStarter,
			currentCount: 9,
			wantError:    false,
		},
		{
			name:         "starter plan - at limit",
			plan:         PlanStarter,
			currentCount: 10,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "business plan - within limit",
			plan:         PlanBusiness,
			currentCount: 49,
			wantError:    false,
		},
		{
			name:         "enterprise plan - unlimited",
			plan:         PlanEnterprise,
			currentCount: 999999,
			wantError:    false,
		},
	}

	for _, tt := range tests {
		tt := tt // capture range variable
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := ValidateModelLimit(tt.plan, tt.currentCount)
			if tt.wantError {
				assert.Error(t, err)
				if tt.expectedErr != nil {
					assert.ErrorIs(t, err, tt.expectedErr)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestValidateItemLimit(t *testing.T) {

	SetSubscriptionConfig(setupTestConfig())

	tests := []struct {
		name         string
		plan         PlanType
		currentCount int
		wantError    bool
		expectedErr  error
	}{
		{
			name:         "free plan - within limit",
			plan:         PlanFree,
			currentCount: 99,
			wantError:    false,
		},
		{
			name:         "free plan - at limit",
			plan:         PlanFree,
			currentCount: 100,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "starter plan - within limit",
			plan:         PlanStarter,
			currentCount: 999,
			wantError:    false,
		},
		{
			name:         "starter plan - at limit",
			plan:         PlanStarter,
			currentCount: 1000,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "business plan - within limit",
			plan:         PlanBusiness,
			currentCount: 9999,
			wantError:    false,
		},
		{
			name:         "advanced plan - within limit",
			plan:         PlanAdvanced,
			currentCount: 99999,
			wantError:    false,
		},
		{
			name:         "enterprise plan - unlimited",
			plan:         PlanEnterprise,
			currentCount: 999999,
			wantError:    false,
		},
	}

	for _, tt := range tests {
		tt := tt // capture range variable
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := ValidateItemLimit(tt.plan, tt.currentCount)
			if tt.wantError {
				assert.Error(t, err)
				if tt.expectedErr != nil {
					assert.ErrorIs(t, err, tt.expectedErr)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestValidateIntegrationLimit(t *testing.T) {

	SetSubscriptionConfig(setupTestConfig())

	tests := []struct {
		name         string
		plan         PlanType
		currentCount int
		wantError    bool
		expectedErr  error
	}{
		{
			name:         "free plan - within limit",
			plan:         PlanFree,
			currentCount: 0,
			wantError:    false,
		},
		{
			name:         "free plan - at limit",
			plan:         PlanFree,
			currentCount: 1,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "starter plan - within limit",
			plan:         PlanStarter,
			currentCount: 2,
			wantError:    false,
		},
		{
			name:         "starter plan - at limit",
			plan:         PlanStarter,
			currentCount: 3,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "business plan - within limit",
			plan:         PlanBusiness,
			currentCount: 9,
			wantError:    false,
		},
		{
			name:         "business plan - at limit",
			plan:         PlanBusiness,
			currentCount: 10,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "enterprise plan - unlimited",
			plan:         PlanEnterprise,
			currentCount: 999999,
			wantError:    false,
		},
	}

	for _, tt := range tests {
		tt := tt // capture range variable
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := ValidateIntegrationLimit(tt.plan, tt.currentCount)
			if tt.wantError {
				assert.Error(t, err)
				if tt.expectedErr != nil {
					assert.ErrorIs(t, err, tt.expectedErr)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestValidateLimit(t *testing.T) {

	tests := []struct {
		name         string
		limit        int
		currentCount int
		wantError    bool
		expectedErr  error
	}{
		{
			name:         "unlimited limit (-1)",
			limit:        -1,
			currentCount: 999999,
			wantError:    false,
		},
		{
			name:         "within limit",
			limit:        5,
			currentCount: 4,
			wantError:    false,
		},
		{
			name:         "at limit",
			limit:        5,
			currentCount: 5,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "over limit",
			limit:        5,
			currentCount: 6,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "zero limit",
			limit:        0,
			currentCount: 0,
			wantError:    true,
			expectedErr:  ErrLimitExceeded,
		},
		{
			name:         "zero current count",
			limit:        10,
			currentCount: 0,
			wantError:    false,
		},
	}

	for _, tt := range tests {
		tt := tt // capture range variable
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := validateLimit(tt.limit, tt.currentCount)
			if tt.wantError {
				assert.Error(t, err)
				if tt.expectedErr != nil {
					assert.ErrorIs(t, err, tt.expectedErr)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestIsLimitsEnabled(t *testing.T) {

	tests := []struct {
		name     string
		config   SubscriptionLimitConfig
		expected bool
	}{
		{
			name: "limits enabled",
			config: SubscriptionLimitConfig{
				Enabled: true,
				Free:    PlanLimitConfig{ProjectLimit: 1},
			},
			expected: true,
		},
		{
			name: "limits disabled",
			config: SubscriptionLimitConfig{
				Enabled: false,
				Free:    PlanLimitConfig{ProjectLimit: 1},
			},
			expected: false,
		},
	}

	for _, tt := range tests {
		tt := tt // capture range variable
		t.Run(tt.name, func(t *testing.T) {
			SetSubscriptionConfig(tt.config)
			result := IsLimitsEnabled()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestValidateWithLimitsDisabled(t *testing.T) {

	disabledConfig := SubscriptionLimitConfig{
		Enabled: false,
		Free: PlanLimitConfig{
			ProjectLimit:         1,
			ModelPerProjectLimit: 1,
			ItemPerModelLimit:    1,
			IntegrationLimit:     1,
		},
	}
	SetSubscriptionConfig(disabledConfig)

	tests := []struct {
		name      string
		validator func() error
	}{
		{
			name:      "project validation bypassed",
			validator: func() error { return ValidateProjectLimit(PlanFree, 999) },
		},
		{
			name:      "model validation bypassed",
			validator: func() error { return ValidateModelLimit(PlanFree, 999) },
		},
		{
			name:      "item validation bypassed",
			validator: func() error { return ValidateItemLimit(PlanFree, 999) },
		},
		{
			name:      "integration validation bypassed",
			validator: func() error { return ValidateIntegrationLimit(PlanFree, 999) },
		},
	}

	for _, tt := range tests {
		tt := tt // capture range variable
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.validator()
			assert.NoError(t, err)
		})
	}
}

// Mock dashboard API for testing
type mockDashboardAPI struct {
	subscription *gateway.WorkspaceSubscription
	err          error
}

func (m *mockDashboardAPI) GetWorkspaceSubscription(ctx context.Context, workspaceID accountdomain.WorkspaceID, authToken string) (*gateway.WorkspaceSubscription, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.subscription, nil
}

func TestGetWorkspacePlan(t *testing.T) {

	ctx := context.Background()
	workspaceID := accountdomain.NewWorkspaceID()
	testToken := "test-token"

	tests := []struct {
		name            string
		dashboardConfig DashboardConfig
		dashboardAPI    gateway.Dashboard
		expectedPlan    PlanType
	}{
		{
			name: "dashboard API disabled",
			dashboardConfig: DashboardConfig{
				URL:     "https://test.api.com",
				Enabled: false,
			},
			dashboardAPI: nil,
			expectedPlan: PlanFree,
		},
		{
			name: "dashboard API enabled but nil client",
			dashboardConfig: DashboardConfig{
				URL:     "https://test.api.com",
				Enabled: true,
			},
			dashboardAPI: nil,
			expectedPlan: PlanFree,
		},
		{
			name: "dashboard API success - business plan",
			dashboardConfig: DashboardConfig{
				URL:     "https://test.api.com",
				Enabled: true,
			},
			dashboardAPI: &mockDashboardAPI{
				subscription: &gateway.WorkspaceSubscription{
					ContractedPlan: gateway.ContractedPlan{
						PlanType: "business",
					},
				},
			},
			expectedPlan: PlanBusiness,
		},
		{
			name: "dashboard API success - enterprise plan",
			dashboardConfig: DashboardConfig{
				URL:     "https://test.api.com",
				Enabled: true,
			},
			dashboardAPI: &mockDashboardAPI{
				subscription: &gateway.WorkspaceSubscription{
					ContractedPlan: gateway.ContractedPlan{
						PlanType: "enterprise",
					},
				},
			},
			expectedPlan: PlanEnterprise,
		},
		{
			name: "dashboard API error fallback to free",
			dashboardConfig: DashboardConfig{
				URL:     "https://test.api.com",
				Enabled: true,
			},
			dashboardAPI: &mockDashboardAPI{
				err: errors.New("API error"),
			},
			expectedPlan: PlanFree,
		},
		{
			name: "dashboard API unknown plan fallback to free",
			dashboardConfig: DashboardConfig{
				URL:     "https://test.api.com",
				Enabled: true,
			},
			dashboardAPI: &mockDashboardAPI{
				subscription: &gateway.WorkspaceSubscription{
					ContractedPlan: gateway.ContractedPlan{
						PlanType: "unknown-plan",
					},
				},
			},
			expectedPlan: PlanFree,
		},
	}

	for _, tt := range tests {
		tt := tt // capture range variable
		t.Run(tt.name, func(t *testing.T) {
			SetDashboardConfig(tt.dashboardConfig)
			SetDashboardAPI(tt.dashboardAPI)

			plan := GetWorkspacePlan(ctx, workspaceID, testToken)
			assert.Equal(t, tt.expectedPlan, plan)
		})
	}
}

func TestConvertDashboardPlanType(t *testing.T) {

	tests := []struct {
		name              string
		dashboardPlanType string
		expected          PlanType
	}{
		{
			name:              "free plan lowercase",
			dashboardPlanType: "free",
			expected:          PlanFree,
		},
		{
			name:              "free plan uppercase",
			dashboardPlanType: "FREE",
			expected:          PlanFree,
		},
		{
			name:              "free plan with spaces",
			dashboardPlanType: "  Free  ",
			expected:          PlanFree,
		},
		{
			name:              "starter plan",
			dashboardPlanType: "starter",
			expected:          PlanStarter,
		},
		{
			name:              "starter plan mixed case",
			dashboardPlanType: "Starter",
			expected:          PlanStarter,
		},
		{
			name:              "business plan",
			dashboardPlanType: "business",
			expected:          PlanBusiness,
		},
		{
			name:              "advanced plan",
			dashboardPlanType: "advanced",
			expected:          PlanAdvanced,
		},
		{
			name:              "enterprise plan",
			dashboardPlanType: "enterprise",
			expected:          PlanEnterprise,
		},
		{
			name:              "unknown plan",
			dashboardPlanType: "unknown",
			expected:          PlanFree,
		},
		{
			name:              "empty string",
			dashboardPlanType: "",
			expected:          PlanFree,
		},
		{
			name:              "special characters",
			dashboardPlanType: "!@#$%",
			expected:          PlanFree,
		},
		{
			name:              "numeric string",
			dashboardPlanType: "123",
			expected:          PlanFree,
		},
	}

	for _, tt := range tests {
		tt := tt // capture range variable
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := convertDashboardPlanType(tt.dashboardPlanType)
			assert.Equal(t, tt.expected, result)
		})
	}
}
