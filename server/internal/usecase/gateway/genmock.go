package gateway

//go:generate go run github.com/golang/mock/mockgen -source=./task.go -destination=./gatewaymock/task.go -package=gatewaymock
//go:generate go run github.com/golang/mock/mockgen -source=./policy_checker.go -destination=./gatewaymock/policy_checker.go -package=gatewaymock
//go:generate go run github.com/golang/mock/mockgen -source=./authorization.go -destination=./gatewaymock/authorization.go -package=gatewaymock
