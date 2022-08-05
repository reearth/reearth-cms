package memorygit

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestInnerValues_GetByVersionOrRef(t *testing.T) {
	assert.Equal(t, &innerValue[string]{
		value:   "foo3",
		version: "c",
	}, innerValues[string]([]innerValue[string]{
		{
			value:   "foo1",
			version: "a",
		},
		{
			value:   "foo2",
			version: "b",
		},
		{
			value:   "foo3",
			version: "c",
		},
	}).GetByVersionOrRef(VersionOrRef{
		version: "c",
	}))

	assert.Equal(t, &innerValue[string]{
		value:   "foo2",
		version: "b",
		ref:     lo.ToPtr(Ref("main")),
	}, innerValues[string]([]innerValue[string]{
		{
			value:   "foo1",
			version: "a",
		},
		{
			value:   "foo2",
			version: "b",
			ref:     lo.ToPtr(Ref("main")),
		},
		{
			value:   "foo3",
			version: "c",
		},
	}).GetByVersionOrRef(VersionOrRef{
		ref: "main",
	}))

	assert.Nil(t, innerValues[string]([]innerValue[string]{
		{
			value:   "foo1",
			version: "a",
		},
		{
			value:   "foo2",
			version: "b",
		},
		{
			value:   "foo3",
			version: "c",
		},
	}).GetByVersionOrRef(VersionOrRef{
		version: "d",
	}))

	assert.Nil(t, innerValues[string]([]innerValue[string]{
		{
			value:   "foo1",
			version: "a",
		},
		{
			value:   "foo2",
			version: "b",
		},
		{
			value:   "foo3",
			version: "c",
			ref:     lo.ToPtr(Ref("main")),
		},
	}).GetByVersionOrRef(VersionOrRef{
		ref: "main2",
	}))
}

func TestInnerValues_UpdateRef(t *testing.T) {
	type args struct {
		ref     Ref
		version *Version
	}

	tests := []struct {
		name   string
		target innerValues[string]
		args   args
		want   innerValues[string]
	}{
		{
			name: "ref is not found",
			target: innerValues[string]{
				{value: "a", version: Version("a"), ref: nil},
				{value: "b", version: Version("b"), ref: lo.ToPtr(Ref("B"))},
			},
			args: args{
				ref:     Ref("A"),
				version: nil,
			},
			want: innerValues[string]{
				{value: "a", version: Version("a"), ref: nil},
				{value: "b", version: Version("b"), ref: lo.ToPtr(Ref("B"))},
			},
		},
		{
			name: "ref should be deleted",
			target: innerValues[string]{
				{value: "a", version: Version("a"), ref: nil},
				{value: "b", version: Version("b"), ref: lo.ToPtr(Ref("B"))},
			},
			args: args{
				ref:     Ref("B"),
				version: nil,
			},
			want: innerValues[string]{
				{value: "a", version: Version("a"), ref: nil},
				{value: "b", version: Version("b"), ref: nil},
			},
		},
		{
			name: "new ref should be set",
			target: innerValues[string]{
				{value: "a", version: Version("a"), ref: nil},
				{value: "b", version: Version("b"), ref: lo.ToPtr(Ref("B"))},
			},
			args: args{
				ref:     Ref("A"),
				version: lo.ToPtr(Version("a")),
			},
			want: innerValues[string]{
				{value: "a", version: Version("a"), ref: lo.ToPtr(Ref("A"))},
				{value: "b", version: Version("b"), ref: lo.ToPtr(Ref("B"))},
			},
		},
		{
			name: "ref should be moved",
			target: innerValues[string]{
				{value: "a", version: Version("a"), ref: nil},
				{value: "b", version: Version("b"), ref: lo.ToPtr(Ref("B"))},
			},
			args: args{
				ref:     Ref("B"),
				version: lo.ToPtr(Version("a")),
			},
			want: innerValues[string]{
				{value: "a", version: Version("a"), ref: lo.ToPtr(Ref("B"))},
				{value: "b", version: Version("b"), ref: nil},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			target := tt.target
			target.UpdateRef(tt.args.ref, tt.args.version)
			assert.Equal(t, tt.want, target)
		})
	}
}

func Test_innerValues_GetByVersion(t *testing.T) {
	v1 := innerValue[string]{value: "a", version: Version("a"), ref: nil}
	v2 := innerValue[string]{value: "b", version: Version("b"), ref: lo.ToPtr(Ref("B"))}
	values := innerValues[string]{v1, v2}
	got := values.GetByVersion(Version("a"))
	assert.Equal(t, &v1, got)
	got2 := values.GetByVersion(Version("c"))
	var expected *innerValue[string]
	assert.Equal(t, expected, got2)
}
func Test_innerValues_GetByRef(t *testing.T) {
	v1 := innerValue[string]{value: "a", version: Version("a"), ref: nil}
	v2 := innerValue[string]{value: "b", version: Version("b"), ref: lo.ToPtr(Ref("B"))}
	values := innerValues[string]{v1, v2}
	got := values.GetByRef(Ref("B"))
	assert.Equal(t, &v2, got)
	got2 := values.GetByRef(Ref("A"))
	var expected *innerValue[string]
	assert.Equal(t, expected, got2)
}
