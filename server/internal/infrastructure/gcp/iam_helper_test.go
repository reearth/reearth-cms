package gcp

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestClassifyAccess(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		state string
		want  accessOutcome
	}{
		{name: "granted", state: "GRANTED", want: accessOK},
		{name: "conditionally granted is not a failure", state: "UNKNOWN_CONDITIONAL", want: accessOK},
		{name: "not granted", state: "NOT_GRANTED", want: accessDenied},
		{name: "caller cannot read policies", state: "UNKNOWN_INFO_DENIED", want: accessInconclusive},
		{name: "unspecified", state: "ACCESS_STATE_UNSPECIFIED", want: accessInconclusive},
		{name: "empty", state: "", want: accessInconclusive},
		{name: "unrecognised state", state: "SOMETHING_NEW", want: accessInconclusive},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, classifyAccess(tt.state))
		})
	}
}

func TestRequiredAccesses(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		conf *TaskConfig
		want []requiredAccess
	}{
		{
			name: "logs only when nothing else is configured",
			conf: &TaskConfig{GCPProject: "p"},
			want: []requiredAccess{
				{
					what:             "write logs",
					permission:       permWriteLogs,
					fullResourceName: "//cloudresourcemanager.googleapis.com/projects/p",
				},
			},
		},
		{
			name: "empty secret names are skipped",
			conf: &TaskConfig{GCPProject: "p", DBSecretName: "db", AccountDBSecretName: ""},
			want: []requiredAccess{
				{
					what:             "write logs",
					permission:       permWriteLogs,
					fullResourceName: "//cloudresourcemanager.googleapis.com/projects/p",
				},
				{
					what:             "access secret db",
					permission:       permAccessSecret,
					fullResourceName: "//secretmanager.googleapis.com/projects/p/secrets/db",
				},
			},
		},
		{
			name: "bucket adds read and write object permissions",
			conf: &TaskConfig{GCPProject: "p", GCSBucket: "b"},
			want: []requiredAccess{
				{
					what:             "write logs",
					permission:       permWriteLogs,
					fullResourceName: "//cloudresourcemanager.googleapis.com/projects/p",
				},
				{
					what:             "read bucket objects",
					permission:       permGetObject,
					fullResourceName: "//storage.googleapis.com/projects/_/buckets/b",
				},
				{
					what:             "write bucket objects",
					permission:       permCreateObject,
					fullResourceName: "//storage.googleapis.com/projects/_/buckets/b",
				},
			},
		},
		{
			name: "both secrets and a bucket",
			conf: &TaskConfig{GCPProject: "p", DBSecretName: "db", AccountDBSecretName: "db-users", GCSBucket: "b"},
			want: []requiredAccess{
				{
					what:             "write logs",
					permission:       permWriteLogs,
					fullResourceName: "//cloudresourcemanager.googleapis.com/projects/p",
				},
				{
					what:             "access secret db",
					permission:       permAccessSecret,
					fullResourceName: "//secretmanager.googleapis.com/projects/p/secrets/db",
				},
				{
					what:             "access secret db-users",
					permission:       permAccessSecret,
					fullResourceName: "//secretmanager.googleapis.com/projects/p/secrets/db-users",
				},
				{
					what:             "read bucket objects",
					permission:       permGetObject,
					fullResourceName: "//storage.googleapis.com/projects/_/buckets/b",
				},
				{
					what:             "write bucket objects",
					permission:       permCreateObject,
					fullResourceName: "//storage.googleapis.com/projects/_/buckets/b",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, requiredAccesses(tt.conf))
		})
	}
}

func TestCheckServiceAccountPermissions_Config(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		conf *TaskConfig
	}{
		{name: "missing project", conf: &TaskConfig{BuildServiceAccount: "sa@p.iam.gserviceaccount.com"}},
		{name: "missing service account", conf: &TaskConfig{GCPProject: "p"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Both cases must fail before any API call is attempted.
			assert.Error(t, CheckServiceAccountPermissions(context.Background(), tt.conf))
		})
	}
}
