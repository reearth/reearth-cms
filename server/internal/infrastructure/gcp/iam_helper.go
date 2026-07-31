package gcp

import (
	"context"
	"fmt"
	"strings"

	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	policytroubleshooter "google.golang.org/api/policytroubleshooter/v1"
)

const (
	permWriteLogs    = "logging.logEntries.create"
	permAccessSecret = "secretmanager.versions.access"
	permGetObject    = "storage.objects.get"
	permCreateObject = "storage.objects.create"
)

// accessOutcome is how an IAM access state should be treated by the health check.
type accessOutcome int

const (
	accessOK accessOutcome = iota
	accessDenied
	accessInconclusive
)

// requiredAccess is a single "can this principal do X on Y" question.
type requiredAccess struct {
	what             string
	permission       string
	fullResourceName string
}

// classifyAccess maps a Policy Troubleshooter access state onto an outcome.
// Only an explicit NOT_GRANTED is treated as a failure; states that merely mean
// "cannot determine" must not fail startup.
func classifyAccess(state string) accessOutcome {
	switch state {
	case "GRANTED", "UNKNOWN_CONDITIONAL":
		return accessOK
	case "NOT_GRANTED":
		return accessDenied
	default:
		return accessInconclusive
	}
}

// requiredAccesses lists the permissions the build service account needs for the
// task runner features: writing build logs, reading the DB secrets used by item
// import/copy, and reading/writing assets in the GCS bucket.
func requiredAccesses(conf *TaskConfig) []requiredAccess {
	project := conf.GCPProject

	accesses := []requiredAccess{{
		what:             "write logs",
		permission:       permWriteLogs,
		fullResourceName: fmt.Sprintf("//cloudresourcemanager.googleapis.com/projects/%s", project),
	}}

	for _, secret := range []string{conf.DBSecretName, conf.AccountDBSecretName} {
		if secret == "" {
			continue
		}
		accesses = append(accesses, requiredAccess{
			what:             "access secret " + secret,
			permission:       permAccessSecret,
			fullResourceName: fmt.Sprintf("//secretmanager.googleapis.com/projects/%s/secrets/%s", project, secret),
		})
	}

	if conf.GCSBucket != "" {
		bucket := fmt.Sprintf("//storage.googleapis.com/projects/_/buckets/%s", conf.GCSBucket)
		accesses = append(accesses,
			requiredAccess{what: "read bucket objects", permission: permGetObject, fullResourceName: bucket},
			requiredAccess{what: "write bucket objects", permission: permCreateObject, fullResourceName: bucket},
		)
	}

	return accesses
}

// CheckServiceAccountPermissions verifies that the build service account can write
// logs and access the secrets required by item import/copy.
func CheckServiceAccountPermissions(ctx context.Context, conf *TaskConfig) error {
	if conf.GCPProject == "" {
		return rerror.ErrInternalBy(fmt.Errorf("GCP project is not configured"))
	}
	if conf.BuildServiceAccount == "" {
		return rerror.ErrInternalBy(fmt.Errorf("build service account is not configured"))
	}

	svc, err := policytroubleshooter.NewService(ctx)
	if err != nil {
		log.Warnf("gcp: skipping service account permission check: failed to create policy troubleshooter service: %v", err)
		return nil
	}

	var denied []string
	for _, a := range requiredAccesses(conf) {
		res, err := svc.Iam.Troubleshoot(&policytroubleshooter.GoogleCloudPolicytroubleshooterV1TroubleshootIamPolicyRequest{
			AccessTuple: &policytroubleshooter.GoogleCloudPolicytroubleshooterV1AccessTuple{
				Principal:        conf.BuildServiceAccount,
				Permission:       a.permission,
				FullResourceName: a.fullResourceName,
			},
		}).Context(ctx).Do()
		if err != nil {
			log.Warnf("gcp: cannot verify that %s can %s: %v", conf.BuildServiceAccount, a.what, err)
			continue
		}

		switch classifyAccess(res.Access) {
		case accessDenied:
			denied = append(denied, fmt.Sprintf("%s (%s)", a.what, a.permission))
		case accessInconclusive:
			log.Warnf("gcp: cannot determine whether %s can %s (access state %q)", conf.BuildServiceAccount, a.what, res.Access)
		case accessOK:
		}
	}

	if len(denied) > 0 {
		return rerror.ErrInternalBy(fmt.Errorf("build service account %s is missing permissions to: %s", conf.BuildServiceAccount, strings.Join(denied, ", ")))
	}
	return nil
}
