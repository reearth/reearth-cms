package workspace

import (
	"context"
	"strings"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

var (
	ErrLimitExceeded = rerror.NewE(i18n.T("subscription limit exceeded"))
)

type PlanType string

const (
	PlanFree       PlanType = "free"
	PlanStarter    PlanType = "starter"
	PlanBusiness   PlanType = "business"
	PlanAdvanced   PlanType = "advanced"
	PlanEnterprise PlanType = "enterprise"
)

type SubscriptionLimitConfig struct {
	Enabled    bool
	Free       PlanLimitConfig
	Starter    PlanLimitConfig
	Business   PlanLimitConfig
	Advanced   PlanLimitConfig
	Enterprise PlanLimitConfig
}

type PlanLimitConfig struct {
	ProjectLimit         int
	ModelPerProjectLimit int
	ItemPerModelLimit    int
	IntegrationLimit     int
}

var globalSubscriptionConfig SubscriptionLimitConfig

// Note: Using gateway.Dashboard interface and gateway.WorkspaceSubscription directly

var globalDashboardAPI gateway.Dashboard
var globalDashboardConfig DashboardConfig

type DashboardConfig struct {
	URL     string
	Enabled bool
}

// SetSubscriptionConfig sets the global subscription configuration
func SetSubscriptionConfig(config SubscriptionLimitConfig) {
	globalSubscriptionConfig = config
}

// SetDashboardAPI sets the global dashboard API client
func SetDashboardAPI(api gateway.Dashboard) {
	globalDashboardAPI = api
}

// SetDashboardConfig sets the global dashboard configuration
func SetDashboardConfig(config DashboardConfig) {
	globalDashboardConfig = config
}

// GetPlanLimits returns the limits for a given subscription plan
func GetPlanLimits(plan PlanType) PlanLimitConfig {
	var configLimits PlanLimitConfig

	switch plan {
	case PlanFree:
		configLimits = globalSubscriptionConfig.Free
	case PlanStarter:
		configLimits = globalSubscriptionConfig.Starter
	case PlanBusiness:
		configLimits = globalSubscriptionConfig.Business
	case PlanAdvanced:
		configLimits = globalSubscriptionConfig.Advanced
	case PlanEnterprise:
		configLimits = globalSubscriptionConfig.Enterprise
	default:
		// Default to free plan
		configLimits = globalSubscriptionConfig.Free
	}

	return configLimits
}

// IsLimitsEnabled returns whether subscription limits are enabled
func IsLimitsEnabled() bool {
	return globalSubscriptionConfig.Enabled
}

// ValidateProjectLimit checks if creating a new project would exceed the limit
func ValidateProjectLimit(plan PlanType, currentCount int) error {
	if !IsLimitsEnabled() {
		return nil // Limits are disabled, allow all operations
	}
	limits := GetPlanLimits(plan)
	return validateLimit(limits.ProjectLimit, currentCount)
}

// ValidateModelLimit checks if creating a new model would exceed the limit
func ValidateModelLimit(plan PlanType, currentCount int) error {
	if !IsLimitsEnabled() {
		return nil // Limits are disabled, allow all operations
	}
	limits := GetPlanLimits(plan)
	return validateLimit(limits.ModelPerProjectLimit, currentCount)
}

// ValidateItemLimit checks if creating a new item would exceed the limit
func ValidateItemLimit(plan PlanType, currentCount int) error {
	if !IsLimitsEnabled() {
		return nil // Limits are disabled, allow all operations
	}
	limits := GetPlanLimits(plan)
	return validateLimit(limits.ItemPerModelLimit, currentCount)
}

// ValidateIntegrationLimit checks if adding a new integration would exceed the limit
func ValidateIntegrationLimit(plan PlanType, currentCount int) error {
	if !IsLimitsEnabled() {
		return nil // Limits are disabled, allow all operations
	}
	limits := GetPlanLimits(plan)
	return validateLimit(limits.IntegrationLimit, currentCount)
}

// validateLimit checks if adding one more item would exceed the limit
func validateLimit(limit int, currentCount int) error {
	if limit == -1 {
		return nil // unlimited
	}
	if currentCount >= limit {
		return ErrLimitExceeded
	}
	return nil
}

// GetWorkspacePlan returns the subscription plan for a workspace
func GetWorkspacePlan(ctx context.Context, workspaceID accountdomain.WorkspaceID, authToken string) PlanType {
	// If dashboard API is not enabled or not configured, return free plan
	if !globalDashboardConfig.Enabled || globalDashboardAPI == nil {
		log.Debugf("dashboard API disabled or not configured, using free plan for workspace %s", workspaceID.String())
		return PlanFree
	}

	subscription, err := globalDashboardAPI.GetWorkspaceSubscription(ctx, workspaceID, authToken)
	if err != nil {
		log.Warnf("failed to fetch subscription from dashboard API for workspace %s: %v, falling back to free plan", workspaceID.String(), err)
		return PlanFree
	}

	plan := convertDashboardPlanType(subscription.ContractedPlan.PlanType)
	log.Debugf("fetched plan %s for workspace %s from dashboard API", plan, workspaceID.String())
	return plan
}

func convertDashboardPlanType(dashboardPlanType string) PlanType {
	normalized := strings.ToLower(strings.TrimSpace(dashboardPlanType))

	switch normalized {
	case "free":
		return PlanFree
	case "starter":
		return PlanStarter
	case "business":
		return PlanBusiness
	case "advanced":
		return PlanAdvanced
	case "enterprise":
		return PlanEnterprise
	default:
		log.Warnf("unknown dashboard plan type '%s', defaulting to free", dashboardPlanType)
		return PlanFree
	}
}
