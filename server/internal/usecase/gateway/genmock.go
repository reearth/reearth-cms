package gateway

//go:generate gp run github.com/golang/mock/mockgen -source=./task.go -destination=./gatewaymock/task.go -package=gatewaymock
//go:generate gp run github.com/golang/mock/mockgen -source=./policy_checker.go -destination=./gatewaymock/policy_checker.go -package=gatewaymock
//go:generate gp run github.com/golang/mock/mockgen -source=./account.go -destination=./gatewaymock/account.go -package=gatewaymock
