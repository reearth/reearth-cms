package dashboard

import "github.com/reearth/reearth-cms/server/pkg/workspaceplan"

type PlanType string

const (
	PlanFree     PlanType = "free"
	PlanStarter  PlanType = "starter"
	PlanBusiness PlanType = "business"
	PlanAdvanced PlanType = "advanced"
)

type Limits struct {
	ProjectCount int `json:"count"`
}

type Plan struct {
	Type   PlanType `json:"type"`
	Limits Limits   `json:"limits"`
}

func FromPlanType(p PlanType) workspaceplan.PlanType {
	switch p {
	case PlanFree:
		return workspaceplan.WorkspacePlanFree
	case PlanStarter:
		return workspaceplan.WorkspacePlanStarter
	case PlanBusiness:
		return workspaceplan.WorkspacePlanBusiness
	case PlanAdvanced:
		return workspaceplan.WorkspacePlanAdvanced
	default:
		return workspaceplan.WorkspacePlanFree
	}
}

func FromPlan(p Plan) workspaceplan.Plan {
	return workspaceplan.Plan{
		Type: FromPlanType(p.Type),
		Limits: workspaceplan.Limits{
			ProjectCount: p.Limits.ProjectCount,
		},
	}
}
