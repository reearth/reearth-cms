package workspaceplan

type PlanType string

const (
	WorkspacePlanFree     PlanType = "FREE"
	WorkspacePlanStarter  PlanType = "STARTER"
	WorkspacePlanBusiness PlanType = "BUSINESS"
	WorkspacePlanAdvanced PlanType = "ADVANCED"
)

type Limits struct {
	ProjectCount int
}

type Plan struct {
	Type   PlanType
	Limits Limits
}

func (p Plan) CanUsePrivateProject() bool {
	return p.Type != WorkspacePlanFree
}
