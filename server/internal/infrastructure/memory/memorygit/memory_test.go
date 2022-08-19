package memorygit

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
)

func TestVersionedSyncMap_Load(t *testing.T) {
	vsm := &VersionedSyncMap[string, string]{m: util.SyncMapFrom(map[string]innerValues[string]{
		"a": {{value: "A", version: "1"}},
		"b": {{value: "B", version: "1", ref: version.Ref("a").Ref()}},
	})}

	tests := []struct {
		name  string
		m     *VersionedSyncMap[string, string]
		input struct {
			key string
			vor version.VersionOrRef
		}
		want struct {
			output string
			ok     bool
		}
	}{
		{
			name: "should load by version",
			m:    vsm,
			input: struct {
				key string
				vor version.VersionOrRef
			}{
				key: "a",
				vor: version.Version("1").OrRef(),
			},
			want: struct {
				output string
				ok     bool
			}{
				output: "A",
				ok:     true,
			},
		},
		{
			name: "should load by ref",
			m:    vsm,
			input: struct {
				key string
				vor version.VersionOrRef
			}{
				key: "b",
				vor: version.Ref("a").OrVersion(),
			},
			want: struct {
				output string
				ok     bool
			}{
				output: "B",
				ok:     true,
			},
		},
		{
			name: "should fail can't find reference",
			m:    vsm,
			input: struct {
				key string
				vor version.VersionOrRef
			}{
				key: "b",
				vor: version.Ref("xxxx").OrVersion(),
			},
			want: struct {
				output string
				ok     bool
			}{
				output: "",
				ok:     false,
			},
		},
		{
			name: "should fail can't find version",
			m:    vsm,
			input: struct {
				key string
				vor version.VersionOrRef
			}{
				key: "a",
				vor: version.Version("100").OrRef(),
			},
			want: struct {
				output string
				ok     bool
			}{
				output: "",
				ok:     false,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got, ok := tc.m.Load(tc.input.key, tc.input.vor)
			assert.Equal(t, tc.want.output, got)
			assert.True(t, tc.want.ok == ok)
		})
	}
}

func TestVersionedSyncMap_LoadAll(t *testing.T) {
	m := &util.SyncMap[string, innerValues[string]]{}
	m.Store("a", innerValues[string]{{value: "A", version: "1"}})
	m.Store("b", innerValues[string]{{value: "B", version: "1", ref: version.Ref("a").Ref()}})
	m.Store("c", innerValues[string]{{value: "C", version: "1"}})
	m.Store("d", innerValues[string]{{value: "D", version: "2", ref: version.Ref("a").Ref()}})
	vsm := &VersionedSyncMap[string, string]{m: m}
	tests := []struct {
		name  string
		m     *VersionedSyncMap[string, string]
		input struct {
			keys []string
			vor  version.VersionOrRef
		}
		want []string
	}{
		{
			name: "should load by version",
			m:    vsm,
			input: struct {
				keys []string
				vor  version.VersionOrRef
			}{
				keys: []string{"a", "b"},
				vor:  version.Version("1").OrRef(),
			},
			want: []string{"A", "B"},
		},
		{
			name: "should load by ref",
			m:    vsm,
			input: struct {
				keys []string
				vor  version.VersionOrRef
			}{
				keys: []string{"b", "d"},
				vor:  version.Ref("a").OrVersion(),
			},
			want: []string{"B", "D"},
		},
		{
			name: "should not load",
			m:    vsm,
			input: struct {
				keys []string
				vor  version.VersionOrRef
			}{
				keys: []string{"d"},
				vor:  version.Version("1").OrRef(),
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := tc.m.LoadAll(tc.input.keys, tc.input.vor)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestVersionedSyncMap_Store(t *testing.T) {
	vm := &VersionedSyncMap[string, string]{
		m: &util.SyncMap[string, innerValues[string]]{},
	}

	_, ok := vm.Load("a", version.Version("1").OrRef())
	assert.False(t, ok)

	vm.Store("a", "b", version.Version("1"))

	got, ok := vm.Load("a", version.Version("1").OrRef())
	assert.True(t, ok)
	assert.Equal(t, "b", got)

	vm.Store("a", "c", version.Version("1"))

	got2, ok2 := vm.Load("a", version.Version("1").OrRef())
	assert.True(t, ok2)
	assert.Equal(t, "c", got2)
}

func TestVersionedSyncMap_UpdateRef(t *testing.T) {
	type args struct {
		key     string
		ref     version.Ref
		version version.Version
	}
	tests := []struct {
		name   string
		target *VersionedSyncMap[string, string]
		args   args
		want   innerValues[string]
	}{
		{
			name: "set ref",
			target: &VersionedSyncMap[string, string]{
				m: util.SyncMapFrom(
					map[string]innerValues[string]{
						"1": {
							{value: "a", version: version.Version("a"), ref: nil},
						},
						"2": {
							{value: "a", version: version.Version("a"), ref: nil},
						},
					},
				),
			},
			args: args{
				key:     "1",
				ref:     version.Ref("A"),
				version: version.Version("a"),
			},
			want: innerValues[string]{
				{value: "a", version: version.Version("a"), ref: version.Ref("A").Ref()},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.target.UpdateRef(tt.args.key, tt.args.ref, tt.args.version)

			f, _ := tt.target.m.Load(tt.args.key)
			assert.Equal(t, tt.want, f)
		})
	}
}
