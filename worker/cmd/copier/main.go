package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
)

func main() {
	topic := os.Getenv("REEARTH_CMS_COPIER_TOPIC")
	project := os.Getenv("GOOGLE_CLOUD_PROJECT")
	modelID := os.Getenv("REEARTH_CMS_COPIER_MODEL_ID")
	name := os.Getenv("REEARTH_CMS_COPIER_NAME")
	// run the copier from here
	fmt.Print(topic, project, modelID, name)

	ctx := context.Background()

	cmd := exec.CommandContext(ctx, os.Args[1], os.Args[2:]...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	hasError := false
	if err := cmd.Run(); err != nil {
		hasError = true
	}

	if hasError {
		os.Exit(1)
	}
}
