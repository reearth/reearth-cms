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

func TestVersionedSyncMap_UpdateRef(t *testing.T) {
	m := &util.SyncMap[string, innerValues[string]]{}
	m.Store("a", innerValues[string]{{value: "A", version: "1"}})
	m.Store("b", innerValues[string]{{value: "B", version: "1", ref: lo.ToPtr(Ref("a"))}})
	vsm := &VersionedSyncMap[string, string]{m: m}

	vsm.UpdateRef("a", "xxx", "1")
	//type fields struct {
	//	m *util.SyncMap[string, innerValues[string]]
	//}
	//type args struct {
	//	key    string
	//	ref    Ref
	//	target Version
	//}
	//tests := []struct {
	//	name   string
	//	fields fields
	//	args   args
	//}{
	//	// TODO: Add test cases.
	//}
	//for _, tt := range tests {
	//	t.Run(tt.name, func(t *testing.T) {
	//		m := &VersionedSyncMap{
	//			m: tt.fields.m,
	//		}
	//	})
	//}
}
