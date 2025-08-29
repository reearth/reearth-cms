package gcp

import (
	"context"
	"fmt"

	"slices"

	"github.com/reearth/reearthx/rerror"
	"google.golang.org/api/iam/v1"
)

// CheckServiceAccountPermissions checks if the service account has the required permissions
func CheckServiceAccountPermissions(ctx context.Context, project, serviceAccount string) error {
	// Create IAM service
	iamService, err := iam.NewService(ctx)
	if err != nil {
		return rerror.ErrInternalBy(fmt.Errorf("failed to create IAM service: %w", err))
	}

	// Format the service account resource name
	serviceAccountName := fmt.Sprintf("projects/%s/serviceAccounts/%s", project, serviceAccount)

	// Define the permissions to check
	permissionsToCheck := []string{
		"logging.logEntries.create",
		"secretmanager.secrets.access",
		"storage.objects.get",
		"storage.objects.create",
	}

	// Test the permissions
	testRequest := &iam.TestIamPermissionsRequest{
		Permissions: permissionsToCheck,
	}
	response, err := iamService.Projects.ServiceAccounts.TestIamPermissions(
		serviceAccountName, testRequest).Do()
	if err != nil {
		return rerror.ErrInternalBy(fmt.Errorf("failed to test service account permissions: %w", err))
	}

	// Check if all required permissions are present
	missingPermissions := []string{}
	for _, permission := range permissionsToCheck {
		found := slices.Contains(response.Permissions, permission)
		if !found {
			missingPermissions = append(missingPermissions, permission)
		}
	}

	if len(missingPermissions) > 0 {
		return rerror.ErrInternalBy(fmt.Errorf("service account is missing required permissions: %v", missingPermissions))
	}

	return nil
}
