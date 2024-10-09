#!/bin/sh

set -e

_REEARTH_CONFIG_TEMPLATE_FILE="/opt/reearth-cms/reearth_config.json.template"
_REEARTH_CONFIG_OUTPUT_FILE="/usr/share/nginx/html/reearth_config.json"

envsubst < "$_REEARTH_CONFIG_TEMPLATE_FILE" > "$_REEARTH_CONFIG_OUTPUT_FILE"
