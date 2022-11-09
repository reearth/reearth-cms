package event

type Operator struct {
	user        *UserID
	integration *IntegrationID
	isCMS       bool
}

func OperatorFromUser(user UserID) Operator {
	return Operator{
		user: &user,
	}
}

func OperatorFromIntegration(integration IntegrationID) Operator {
	return Operator{
		integration: &integration,
	}
}

func OperatorFromCMS() Operator {
	return Operator{
		isCMS: true,
	}
}

func (o Operator) User() *UserID {
	return o.user.CloneRef()
}

func (o Operator) Integration() *IntegrationID {
	return o.integration.CloneRef()
}

func (o Operator) CMS() bool {
	return o.isCMS
}

func (o Operator) CMSRef() *bool {
	return &o.isCMS
}

func (o Operator) validate() bool {
	return !o.user.IsNil() || !o.integration.IsNil() || o.CMS()
}
