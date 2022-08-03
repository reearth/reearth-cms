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
			assert.Equal(t, tc.want.output, got)
			assert.True(t, tc.want.ok == ok)
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
		name  string
		m     *VersionedSyncMap[string, string]
		input struct {
			keys []string
			vor  VersionOrRef
		}
		want []string
	}{
		{
			name: "must load a and b",
			m:    vsm,
			input: struct {
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
			input: struct {
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
			input: struct {
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
			got := tc.m.LoadAll(tc.input.keys, tc.input.vor)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestVersionedSyncMap_Store(t *testing.T) {
	vm := &VersionedSyncMap[string, string]{
		m: &util.SyncMap[string, innerValues[string]]{},
	}

	_, ok := vm.Load("a", Version("1").OrRef())
	assert.False(t, ok)

	vm.Store("a", "b", Version("1"))

	got, ok := vm.Load("a", Version("1").OrRef())
	assert.True(t, ok)
	assert.Equal(t, "b", got)

	vm.Store("a", "c", Version("1"))

	got2, ok2 := vm.Load("a", Version("1").OrRef())
	assert.True(t, ok2)
	assert.Equal(t, "c", got2)
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
