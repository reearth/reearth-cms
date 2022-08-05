package memorygit

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestVersionedSyncMap_Load(t *testing.T) {
	m := &util.SyncMap[string, innerValues[string]]{}
	m.Store("a", innerValues[string]{{value: "A", version: "1"}})
	m.Store("b", innerValues[string]{{value: "B", version: "1", ref: lo.ToPtr(Ref("a"))}})
	vsm := &VersionedSyncMap[string, string]{m: m}

	tests := []struct {
		name  string
		m     *VersionedSyncMap[string, string]
		input struct {
			key string
			vor VersionOrRef
		}
		want struct {
			output string
			ok     bool
		}
	}{
		{
			name: "must load by version",
			m:    vsm,
			input: struct {
				key string
				vor VersionOrRef
			}{
				key: "a",
				vor: VersionOrRef{
					version: "1",
				},
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
			name: "must load by reference",
			m:    vsm,
			input: struct {
				key string
				vor VersionOrRef
			}{
				key: "b",
				vor: VersionOrRef{
					ref: "a",
				},
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
			name: "must fail can't find reference",
			m:    vsm,
			input: struct {
				key string
				vor VersionOrRef
			}{
				key: "b",
				vor: VersionOrRef{
					ref: "xxxx",
				},
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
			name: "must fail can't find version",
			m:    vsm,
			input: struct {
				key string
				vor VersionOrRef
			}{
				key: "a",
				vor: VersionOrRef{
					version: "100",
				},
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
			assert.Equal(tt, tc.want.output, got)
			assert.True(tt, tc.want.ok == ok)
		})
	}
}

func TestVersionedSyncMap_LoadAll(t *testing.T) {
	m := &util.SyncMap[string, innerValues[string]]{}
	m.Store("a", innerValues[string]{{value: "A", version: "1"}})
	m.Store("b", innerValues[string]{{value: "B", version: "1", ref: lo.ToPtr(Ref("a"))}})
	m.Store("c", innerValues[string]{{value: "C", version: "1"}})
	m.Store("d", innerValues[string]{{value: "D", version: "2", ref: lo.ToPtr(Ref("a"))}})
	vsm := &VersionedSyncMap[string, string]{m: m}
	tests := []struct {
		name string
		m    *VersionedSyncMap[string, string]
		args struct {
			keys []string
			vor  VersionOrRef
		}
		want []string
	}{
		{
			name: "must load a and b",
			m:    vsm,
			args: struct {
				keys []string
				vor  VersionOrRef
			}{
				keys: []string{"a", "b"},
				vor: VersionOrRef{
					version: "1",
				},
			},
			want: []string{"A", "B"},
		},
		{
			name: "must load b and d",
			m:    vsm,
			args: struct {
				keys []string
				vor  VersionOrRef
			}{
				keys: []string{"b", "d"},
				vor: VersionOrRef{
					ref: "a",
				},
			},
			want: []string{"B", "D"},
		},
		{
			name: "mustn't load item",
			m:    vsm,
			args: struct {
				keys []string
				vor  VersionOrRef
			}{
				keys: []string{"d"},
				vor: VersionOrRef{
					version: "1",
				},
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := tc.m.LoadAll(tc.args.keys, tc.args.vor)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestVersionedSyncMap_Store(t *testing.T) {
	vm := &VersionedSyncMap[string, string]{
		m: &util.SyncMap[string, innerValues[string]]{},
	}
	_, ok := vm.Load("a", Version("1").OrRef())
	assert.False(t, ok)

	type args struct {
		key     string
		value   string
		version Version
	}
	tests := []struct {
		name   string
		args   args
		want   string
		wantOk bool
	}{
		{
			name: "must return b",
			args: args{
				key:     "a",
				value:   "b",
				version: "1",
			},
			want:   "b",
			wantOk: true,
		},
		{
			name: "must return c",
			args: args{
				key:     "a",
				value:   "c",
				version: "1",
			},
			want:   "c",
			wantOk: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			vm.Store(tc.args.key, tc.args.value, tc.args.version)
			got, ok := vm.Load(tc.args.key, tc.args.version.OrRef())
			assert.True(tt, ok == tc.wantOk)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestVersionedSyncMap_UpdateRef(t *testing.T) {
	type args struct {
		key     string
		ref     Ref
		version Version
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
					util.MapEntry[string, innerValues[string]]{
						Key: "1",
						Value: innerValues[string]{
							{value: "a", version: Version("a"), ref: nil},
						},
					},
					util.MapEntry[string, innerValues[string]]{
						Key: "2",
						Value: innerValues[string]{
							{value: "a", version: Version("a"), ref: nil},
						},
					},
				),
			},
			args: args{
				key:     "1",
				ref:     Ref("A"),
				version: Version("a"),
			},
			want: innerValues[string]{
				{value: "a", version: Version("a"), ref: lo.ToPtr(Ref("A"))},
			},
		},
		{
			name: "key not found",
			target: &VersionedSyncMap[string, string]{
				m: util.SyncMapFrom(
					util.MapEntry[string, innerValues[string]]{
						Key: "1",
						Value: innerValues[string]{
							{value: "a", version: "a", ref: nil},
						},
					},
				),
			},
			args: args{
				key:     "2",
				ref:     Ref("A"),
				version: Version("a"),
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tc.target.UpdateRef(tc.args.key, tc.args.ref, tc.args.version)

			f, _ := tc.target.m.Load(tc.args.key)
			assert.Equal(tt, tc.want, f)
		})
	}
}

func TestVersionedSyncMap_Archive(t *testing.T) {
	m := &util.SyncMap[string, innerValues[string]]{}
	m.Store("a", innerValues[string]{{value: "A", version: "1"}})
	m.Store("b", innerValues[string]{{value: "B", version: "1"}})
	vsm := &VersionedSyncMap[string, string]{m: m}
	vsm.Archive("a")
	_, ok := vsm.Load("a", Version("1").OrRef())
	assert.False(t, ok)
}

func TestVersionedSyncMap_ArchiveAll(t *testing.T) {
	m := &util.SyncMap[string, innerValues[string]]{}
	m.Store("a", innerValues[string]{{value: "A", version: "1"}})
	m.Store("b", innerValues[string]{{value: "B", version: "1"}})
	vsm := &VersionedSyncMap[string, string]{m: m}
	vsm.ArchiveAll("a", "b")
	var expected []string
	got := vsm.LoadAll([]string{"a", "b"}, Version("1").OrRef())
	assert.Equal(t, expected, got)
}

func TestVersionedSyncMap_Delete(t *testing.T) {
	m := &util.SyncMap[string, innerValues[string]]{}
	m.Store("a", innerValues[string]{{value: "A", version: "1"}})
	m.Store("b", innerValues[string]{{value: "B", version: "1"}})
	vsm := &VersionedSyncMap[string, string]{m: m}
	vsm.Delete("a")
	_, ok := vsm.Load("a", Version("1").OrRef())
	assert.False(t, ok)
}

func TestVersionedSyncMap_DeleteAll(t *testing.T) {
	m := &util.SyncMap[string, innerValues[string]]{}
	m.Store("a", innerValues[string]{{value: "A", version: "1"}})
	m.Store("b", innerValues[string]{{value: "B", version: "1"}})
	vsm := &VersionedSyncMap[string, string]{m: m}
	vsm.DeleteAll("a", "b")
	var expected []string
	got := vsm.LoadAll([]string{"a", "b"}, Version("1").OrRef())
	assert.Equal(t, expected, got)
}

func TestVersionedSyncMap_DeleteRef(t *testing.T) {
	m := &util.SyncMap[string, innerValues[string]]{}
	m.Store("b", innerValues[string]{{value: "B", version: "1", ref: lo.ToPtr(Ref("a"))}})
	vsm := &VersionedSyncMap[string, string]{m: m}
	vsm.DeleteRef("b", Ref("a"))
	got := vsm.load("b", Version("1").OrRef())
	var expected *Ref
	assert.Equal(t, expected, got.ref)
}
