package memorygit

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
	"golang.org/x/exp/slices"
)

func TestVersionedSyncMap_Load(t *testing.T) {
	vx := version.New()
	vsm := &VersionedSyncMap[string, string]{
		m: util.SyncMapFrom(map[string]*version.Values[string]{
			"a": version.MustBeValues(
				&version.Value[string]{Value: "A", Version: vx},
			),
			"b": version.MustBeValues(
				&version.Value[string]{Value: "B", Version: vx, Refs: version.NewRefs("a")},
			),
		}),
	}

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
				vor: vx.OrRef(),
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
			name: "should fail to find ref",
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
			name: "should fail to find version",
			m:    vsm,
			input: struct {
				key string
				vor version.VersionOrRef
			}{
				key: "a",
				vor: version.New().OrRef(),
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
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got, ok := tc.m.Load(tc.input.key, tc.input.vor)
			assert.Equal(t, tc.want.output, got)
			assert.True(t, tc.want.ok == ok)
		})
	}
}

func TestVersionedSyncMap_LoadAll(t *testing.T) {
	vx, vy := version.New(), version.New()
	vsm := &VersionedSyncMap[string, string]{m: util.SyncMapFrom(
		map[string]*version.Values[string]{
			"a": version.MustBeValues(
				&version.Value[string]{Value: "A", Version: vx},
			),
			"b": version.MustBeValues(
				&version.Value[string]{Value: "B", Version: vx, Refs: version.NewRefs("a")},
			),
			"c": version.MustBeValues(
				&version.Value[string]{Value: "C", Version: vx},
			),
			"d": version.MustBeValues(
				&version.Value[string]{Value: "D", Version: vy, Refs: version.NewRefs("a")},
			),
		},
	)}
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
				vor:  vx.OrRef(),
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
				vor:  vx.OrRef(),
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := tc.m.LoadAll(tc.input.keys, tc.input.vor)
			slices.Sort(got)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestVersionedSyncMap_Store(t *testing.T) {
	vm := &VersionedSyncMap[string, string]{
		m: util.SyncMapFrom(map[string]*version.Values[string]{}),
	}

	_, ok := vm.Load("a", version.Latest.OrVersion())
	assert.False(t, ok)

	vm.Store("a", "b", nil)
	got, ok := vm.Load("a", version.Latest.OrVersion())
	assert.True(t, ok)
	assert.Equal(t, "b", got)

	vm.Store("a", "c", nil)
	got2, ok2 := vm.Load("a", version.Latest.OrVersion())
	assert.True(t, ok2)
	assert.Equal(t, "c", got2)

	vm.Store("a", "d", version.Latest.OrVersion().Ref())
	got3, ok3 := vm.Load("a", version.Latest.OrVersion())
	assert.True(t, ok3)
	assert.Equal(t, "d", got3)
}

func TestVersionedSyncMap_UpdateRef(t *testing.T) {
	vx := version.New()

	type args struct {
		key string
		ref version.Ref
		vr  *version.VersionOrRef
	}
	tests := []struct {
		name   string
		target *VersionedSyncMap[string, string]
		args   args
		want   *version.Values[string]
	}{
		{
			name: "set ref",
			target: &VersionedSyncMap[string, string]{
				m: util.SyncMapFrom(
					map[string]*version.Values[string]{
						"1": version.MustBeValues(&version.Value[string]{Value: "a", Version: vx}),
						"2": version.MustBeValues(&version.Value[string]{Value: "a", Version: vx}),
					},
				),
			},
			args: args{
				key: "1",
				ref: "A",
				vr:  vx.OrRef().Ref(),
			},
			want: version.MustBeValues(
				&version.Value[string]{Value: "a", Version: vx, Refs: version.NewRefs("A")},
			),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.target.UpdateRef(tt.args.key, tt.args.ref, tt.args.vr)

			f, _ := tt.target.m.Load(tt.args.key)
			assert.Equal(t, tt.want, f)
		})
	}
}
