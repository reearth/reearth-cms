package gateway

//go:generate go tool mockgen -destination=gatewaymock/gateway_gen.go -package=gatewaymock . TaskRunner,PolicyChecker,Authorization
