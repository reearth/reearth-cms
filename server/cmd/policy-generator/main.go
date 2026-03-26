package main

import (
	"log"

	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/cerbos/generator"
)

func main() {
	if err := generator.GeneratePolicies(
		rbac.ServiceName,
		rbac.ResourceRules,
		rbac.PolicyFileDir,
	); err != nil {
		log.Fatalf("Failed to generate policies: %v", err)
	}
}
