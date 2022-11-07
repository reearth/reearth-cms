package event

type Operator struct {
	user        *UserID
	integration *IntegrationID
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

func (o Operator) User() *UserID {
	return o.user.CloneRef()
}

func (o Operator) Integration() *IntegrationID {
	return o.integration.CloneRef()
}

func (o Operator) validate() bool {
	return !o.user.IsNil() || !o.integration.IsNil()
}
