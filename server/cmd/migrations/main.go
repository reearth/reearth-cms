package main

import (
	"context"
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/exp/slices"
)

type command = func(ctx context.Context, dbURL string, dryRun bool) error

var commands = map[string]command{
	"items-meta": MigrateItemMeta,
}

func main() {
	// get arg
	if len(os.Args) < 2 {
		fmt.Print("command is not set")
		return
	}
	cmd := os.Args[1]

	command := commands[cmd]
	if command == nil {
		fmt.Printf("command %s not found", cmd)
		return
	}

	// get --wet-run
	dryRun := true
	if slices.Contains(os.Args, "--wet-run") {
		fmt.Printf("wet run\n")
		dryRun = false
	}

	// load .env
	if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
		fmt.Printf("load .env failed: %s\n", err)
		return
	} else if err == nil {
		fmt.Printf("config: .env loaded\n")
	}

	// get db url
	dbURL := os.Getenv("REEARTH_CMS_DB")
	if dbURL == "" {
		fmt.Print("REEARTH_CMS_DB is not set")
		return
	}

	// exec command
	fmt.Printf("command: %s\n", cmd)
	ctx := context.Background()
	if err := command(ctx, dbURL, dryRun); err != nil {
		fmt.Printf("command %s faild: %s\n", cmd, err)
		return
	}
	fmt.Printf("command %s succeeded", cmd)
}
