#!/bin/sh

set -e

# rewrite index.html to change title and favicon
_REEARTH_HTML_FILE="/usr/share/nginx/html/index.html"

# Rewrite title tag in index.html only if REEARTH_CMS_TITLE is set
if [ -n "$REEARTH_CMS_TITLE" ]; then
  sed -i -e "s|<title>.*</title>|<title>${REEARTH_CMS_TITLE}</title>|g" "$_REEARTH_HTML_FILE"
fi

# Rewrite favicon in index.html only if REEARTH_CMS_FAVICON_URL is set
if [ -n "$REEARTH_CMS_FAVICON_URL" ]; then
  sed -i -e "s|<link rel=\"icon\" href=\"[^\"]*\" type=\"image/x-icon\" />|<link rel=\"icon\" href=\"${REEARTH_CMS_FAVICON_URL}\" type=\"image/x-icon\" />|g" "$_REEARTH_HTML_FILE"
fi

# generate reearth_config.json
_REEARTH_CONFIG_TEMPLATE_FILE="/opt/reearth-cms/reearth_config.json.template"
_REEARTH_CONFIG_OUTPUT_FILE="/usr/share/nginx/html/reearth_config.json"

# Wrap with "" if the value doesn't start with '{' and end with '}' (JSON) or "null".
wrap_reearth_cms_variables() {
    for var in $(env | grep '^REEARTH_CMS_' | cut -d= -f1); do
        value=$(printenv "$var")
        if [ -z "$value" ]; then
            eval "export $var='\"\"'"
        elif [ "$value" != "null" ] && ! echo "$value" | grep -qE '^\{.*\}$'; then
            eval "export $var='\"${value}\"'"
        fi
    done
}

wrap_reearth_cms_variables "$@"
envsubst < "$_REEARTH_CONFIG_TEMPLATE_FILE" > "$_REEARTH_CONFIG_OUTPUT_FILE"
if ! jq empty "$_REEARTH_CONFIG_OUTPUT_FILE" > /dev/null 2>&1; then
  echo "Invalid JSON configuration file $_REEARTH_CONFIG_OUTPUT_FILE" >&2
  exit 1
fi
