package workspaceplan

type PlanType string

const (
	WorkspacePlanFree     PlanType = "FREE"
	WorkspacePlanStarter  PlanType = "STARTER"
	WorkspacePlanBusiness PlanType = "BUSINESS"
	WorkspacePlanAdvanced PlanType = "ADVANCED"
)

type Plan struct {
	Type PlanType
}

func (p Plan) CanCreatePrivateProject() bool {
	return p.Type != WorkspacePlanFree
}
