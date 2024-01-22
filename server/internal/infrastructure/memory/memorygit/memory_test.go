package memorygit

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestVersionedSyncMap_Load(t *testing.T) {
	vx := version.NewID()
	vsm := &VersionedSyncMap[string, string, string]{
		m: util.SyncMapFrom(map[string]*version.Versions[string, string]{
			"a": version.NewVersions[string, string](
				version.NewValue(vx, nil, nil, time.Time{}, lo.ToPtr("A")),
			),
			"b": version.NewVersions[string, string](
				version.NewValue(vx, nil, version.NewRefs("a"), time.Time{}, lo.ToPtr("B")),
			),
		}),
	}

	tests := []struct {
		name  string
		m     *VersionedSyncMap[string, string, string]
		input struct {
			key string
			vor version.IDOrRef
		}
		want struct {
			output *string
			ok     bool
		}
	}{
		{
			name: "should load by version",
			m:    vsm,
			input: struct {
				key string
				vor version.IDOrRef
			}{
				key: "a",
				vor: vx.OrRef(),
			},
			want: struct {
				output *string
				ok     bool
			}{
				output: lo.ToPtr("A"),
				ok:     true,
			},
		},
		{
			name: "should load by ref",
			m:    vsm,
			input: struct {
				key string
				vor version.IDOrRef
			}{
				key: "b",
				vor: version.Ref("a").OrVersion(),
			},
			want: struct {
				output *string
				ok     bool
			}{
				output: lo.ToPtr("B"),
				ok:     true,
			},
		},
		{
			name: "should fail to find ref",
			m:    vsm,
			input: struct {
				key string
				vor version.IDOrRef
			}{
				key: "b",
				vor: version.Ref("xxxx").OrVersion(),
			},
			want: struct {
				output *string
				ok     bool
			}{
				output: nil,
				ok:     false,
			},
		},
		{
			name: "should fail to find version",
			m:    vsm,
			input: struct {
				key string
				vor version.IDOrRef
			}{
				key: "a",
				vor: version.NewID().OrRef(),
			},
			want: struct {
				output *string
				ok     bool
			}{
				output: nil,
				ok:     false,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got, ok := tc.m.Load(tc.input.key, tc.input.vor)
			if tc.want.output == nil {
				assert.Nil(t, got)
			} else {
				assert.Equal(t, tc.want.output, got.Value())
			}
			assert.Equal(t, tc.want.ok, ok)
		})
	}
}

func TestVersionedSyncMap_LoadAll(t *testing.T) {
	vx, vy := version.NewID(), version.NewID()
	vsm := &VersionedSyncMap[string, string, string]{m: util.SyncMapFrom(
		map[string]*version.Versions[string, string]{
			"a": version.NewVersions[string, string](
				version.NewValue(vx, nil, nil, time.Time{}, lo.ToPtr("A")),
			),
			"b": version.NewVersions[string, string](
				version.NewValue(vx, nil, version.NewRefs("a"), time.Time{}, lo.ToPtr("B")),
			),
			"c": version.NewVersions[string, string](
				version.NewValue(vx, nil, nil, time.Time{}, lo.ToPtr("C")),
			),
			"d": version.NewVersions[string, string](
				version.NewValue(vy, nil, version.NewRefs("a"), time.Time{}, lo.ToPtr("D")),
			),
		},
	)}
	tests := []struct {
		name  string
		m     *VersionedSyncMap[string, string, string]
		input struct {
			keys []string
			vor  version.IDOrRef
		}
		want []*string
	}{
		{
			name: "should load by version",
			m:    vsm,
			input: struct {
				keys []string
				vor  version.IDOrRef
			}{
				keys: []string{"a", "b"},
				vor:  vx.OrRef(),
			},
			want: []*string{lo.ToPtr("A"), lo.ToPtr("B")},
		},
		{
			name: "should load by ref",
			m:    vsm,
			input: struct {
				keys []string
				vor  version.IDOrRef
			}{
				keys: []string{"b", "d"},
				vor:  version.Ref("a").OrVersion(),
			},
			want: []*string{lo.ToPtr("B"), lo.ToPtr("D")},
		},
		{
			name: "should not load",
			m:    vsm,
			input: struct {
				keys []string
				vor  version.IDOrRef
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
			got := tc.m.LoadAll(tc.input.keys, &tc.input.vor)
			got2 := version.UnwrapValues(got)
			// slices.Sort(got2)
			assert.Equal(t, tc.want, got2)
		})
	}
}

func TestVersionedSyncMap_LoadAllVersions(t *testing.T) {
	vx, vy, vz := version.NewID(), version.NewID(), version.NewID()
	vsm := &VersionedSyncMap[string, string, string]{m: util.SyncMapFrom(
		map[string]*version.Versions[string, string]{
			"a": version.NewVersions[string, string](
				version.NewValue(vx, version.IDs{}, version.Refs{}, time.Time{}, lo.ToPtr("A")),
				version.NewValue(vy, version.IDs{}, version.Refs{}, time.Time{}, lo.ToPtr("B")),
				version.NewValue(vz, version.IDs{}, version.Refs{}, time.Time{}, lo.ToPtr("C")),
			),
		},
	)}
	tests := []struct {
		name  string
		m     *VersionedSyncMap[string, string, string]
		input struct {
			key string
		}
		want *version.Versions[string, string]
	}{
		{
			name: "should load by version",
			m:    vsm,
			input: struct {
				key string
			}{
				key: "a",
			},
			want: version.NewVersions[string, string](
				version.NewValue(vx, version.IDs{}, version.Refs{}, time.Time{}, lo.ToPtr("A")),
				version.NewValue(vy, version.IDs{}, version.Refs{}, time.Time{}, lo.ToPtr("B")),
				version.NewValue(vz, version.IDs{}, version.Refs{}, time.Time{}, lo.ToPtr("C")),
			),
		},
		{
			name: "should not load",
			m:    vsm,
			input: struct {
				key string
			}{
				key: "d",
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := tc.m.LoadAllVersions(tc.input.key)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestVersionedSyncMap_Store(t *testing.T) {
	vm := &VersionedSyncMap[string, string, string]{
		m: util.SyncMapFrom(map[string]*version.Versions[string, string]{}),
		a: util.SyncMapFrom(map[string]*version.Versions[string, string]{}),
	}

	vm.SaveOne("z", lo.ToPtr("x"), nil)

	_, ok := vm.Load("a", version.Latest.OrVersion())
	assert.False(t, ok)

	vm.SaveOne("a", lo.ToPtr("b"), nil)
	got, ok := vm.Load("a", version.Latest.OrVersion())
	assert.True(t, ok)
	assert.Equal(t, lo.ToPtr("b"), got.Value())

	vm.SaveOne("a", lo.ToPtr("c"), nil)
	got2, ok2 := vm.Load("a", version.Latest.OrVersion())
	assert.True(t, ok2)
	assert.Equal(t, lo.ToPtr("c"), got2.Value())

	vm.SaveOne("a", lo.ToPtr("d"), version.Latest.OrVersion().Ref())
	got3, ok3 := vm.Load("a", version.Latest.OrVersion())
	assert.True(t, ok3)
	assert.Equal(t, lo.ToPtr("d"), got3.Value())
}

func TestVersionedSyncMap_UpdateRef(t *testing.T) {
	vx := version.NewID()

	type args struct {
		key string
		ref version.Ref
		vr  *version.IDOrRef
	}
	tests := []struct {
		name   string
		target *VersionedSyncMap[string, string, string]
		args   args
		want   *version.Versions[string, string]
	}{
		{
			name: "set ref",
			target: &VersionedSyncMap[string, string, string]{
				m: util.SyncMapFrom(
					map[string]*version.Versions[string, string]{
						"1": version.NewVersions[string, string](version.NewValue(vx, nil, nil, time.Time{}, lo.ToPtr("a"))),
						"2": version.NewVersions[string, string](version.NewValue(vx, nil, nil, time.Time{}, lo.ToPtr("a"))),
					},
				),
			},
			args: args{
				key: "1",
				ref: "A",
				vr:  vx.OrRef().Ref(),
			},
			want: version.NewVersions[string, string](
				version.NewValue(vx, nil, version.NewRefs("A"), time.Time{}, lo.ToPtr("a")),
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
