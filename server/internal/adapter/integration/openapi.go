package integration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func OpenAPISpecHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		spec, err := rawSpec()
		if err != nil {
			return err
		}

		transformed, err := transformSpec(spec, c.Request())
		if err != nil {
			return err
		}

		return c.JSONBlob(http.StatusOK, transformed)
	}
}

func transformSpec(spec []byte, r *http.Request) ([]byte, error) {
	var doc map[string]interface{}
	if err := json.Unmarshal(spec, &doc); err != nil {
		return nil, fmt.Errorf("failed to unmarshal spec: %w", err)
	}

	origin := resolveOrigin(r)

	doc["servers"] = []interface{}{
		map[string]interface{}{
			"url": "{origin}/api/{workspaceIdOrAlias}",
			"variables": map[string]interface{}{
				"origin": map[string]interface{}{
					"default":     origin,
					"description": "Server origin",
				},
				"workspaceIdOrAlias": map[string]interface{}{
					"default":     "your-workspace-id",
					"description": "Workspace ID or alias",
				},
			},
		},
	}

	if paths, ok := doc["paths"].(map[string]interface{}); ok {
		rewrittenPaths := make(map[string]interface{}, len(paths))
		for path, val := range paths {
			newPath := strings.TrimPrefix(path, "/{workspaceIdOrAlias}")
			if newPath == "" {
				newPath = "/"
			}

			if pathObj, ok := val.(map[string]interface{}); ok {
				removeWorkspaceParam(pathObj)
			}

			rewrittenPaths[newPath] = val
		}
		doc["paths"] = rewrittenPaths
	}

	result, err := json.Marshal(doc)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal spec: %w", err)
	}

	return result, nil
}

func resolveOrigin(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	if proto := r.Header.Get("X-Forwarded-Proto"); proto != "" {
		scheme = proto
	}
	return scheme + "://" + r.Host
}

func removeWorkspaceParam(pathObj map[string]interface{}) {
	// Remove from path-level parameters
	filterWorkspaceParam(pathObj)

	// Remove from each operation's parameters
	for _, method := range []string{"get", "post", "put", "patch", "delete", "options", "head"} {
		if op, ok := pathObj[method].(map[string]interface{}); ok {
			filterWorkspaceParam(op)
		}
	}
}

func filterWorkspaceParam(obj map[string]interface{}) {
	params, ok := obj["parameters"].([]interface{})
	if !ok {
		return
	}

	filtered := make([]interface{}, 0, len(params))
	for _, p := range params {
		param, ok := p.(map[string]interface{})
		if !ok {
			filtered = append(filtered, p)
			continue
		}
		if param["name"] == "workspaceIdOrAlias" && param["in"] == "path" {
			continue
		}
		filtered = append(filtered, p)
	}

	if len(filtered) == 0 {
		delete(obj, "parameters")
	} else {
		obj["parameters"] = filtered
	}
}
