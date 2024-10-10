#!/bin/sh

set -e

_REEARTH_CONFIG_TEMPLATE_FILE="/opt/reearth-cms/reearth_config.json.template"
_REEARTH_CONFIG_OUTPUT_FILE="/usr/share/nginx/html/reearth_config.json"

# Wrap with "" if the value doesn't start with '{' and end with '}' (JSON) or "null".
wrap_reearth_cms_variables() {
    for var in $(env | grep '^REEARTH_CMS_' | cut -d= -f1); do
        value=$(printenv "$var")
        [ "$value" != "null" ] && ! echo "$value" | grep -qE '^\{.*\}$' && export "$var=\"${value}\""
    done
}

wrap_reearth_cms_variables $@
envsubst < "$_REEARTH_CONFIG_TEMPLATE_FILE" > "$_REEARTH_CONFIG_OUTPUT_FILE"
