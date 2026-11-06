package app

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReadConfig_DBCMS(t *testing.T) {
	t.Run("default", func(t *testing.T) {
		t.Setenv("REEARTH_CMS_WORKER_DB_CMS", "")
		assert.NoError(t, os.Unsetenv("REEARTH_CMS_WORKER_DB_CMS"))
		c, err := ReadConfig(false)
		assert.NoError(t, err)
		assert.Equal(t, "reearth_cms", c.DB_CMS)
	})

	t.Run("override", func(t *testing.T) {
		t.Setenv("REEARTH_CMS_WORKER_DB_CMS", "custom_db")
		c, err := ReadConfig(false)
		assert.NoError(t, err)
		assert.Equal(t, "custom_db", c.DB_CMS)
	})
}
