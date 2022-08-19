package memorygit

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/version"
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
	}).GetByVersionOrRef(version.Version("c").OrRef()))

	assert.Equal(t, &innerValue[string]{
		value:   "foo2",
		version: "b",
		ref:     version.Ref("main").Ref(),
	}, innerValues[string]([]innerValue[string]{
		{
			value:   "foo1",
			version: "a",
		},
		{
			value:   "foo2",
			version: "b",
			ref:     version.Ref("main").Ref(),
		},
		{
			value:   "foo3",
			version: "c",
		},
	}).GetByVersionOrRef(version.Ref("main").OrVersion()))

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
	}).GetByVersionOrRef(version.Version("d").OrRef()))

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
			ref:     version.Ref("main").Ref(),
		},
	}).GetByVersionOrRef(version.Ref("main2").OrVersion()))
}

func TestInnerValues_UpdateRef(t *testing.T) {
	type args struct {
		ref     version.Ref
		version *version.Version
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
				{value: "a", version: version.Version("a"), ref: nil},
				{value: "b", version: version.Version("b"), ref: version.Ref("B").Ref()},
			},
			args: args{
				ref:     version.Ref("A"),
				version: nil,
			},
			want: innerValues[string]{
				{value: "a", version: version.Version("a"), ref: nil},
				{value: "b", version: version.Version("b"), ref: version.Ref("B").Ref()},
			},
		},
		{
			name: "ref should be deleted",
			target: innerValues[string]{
				{value: "a", version: version.Version("a"), ref: nil},
				{value: "b", version: version.Version("b"), ref: version.Ref("B").Ref()},
			},
			args: args{
				ref:     version.Ref("B"),
				version: nil,
			},
			want: innerValues[string]{
				{value: "a", version: version.Version("a"), ref: nil},
				{value: "b", version: version.Version("b"), ref: nil},
			},
		},
		{
			name: "new ref should be set",
			target: innerValues[string]{
				{value: "a", version: version.Version("a"), ref: nil},
				{value: "b", version: version.Version("b"), ref: version.Ref("B").Ref()},
			},
			args: args{
				ref:     version.Ref("A"),
				version: version.Version("a").Ref(),
			},
			want: innerValues[string]{
				{value: "a", version: version.Version("a"), ref: version.Ref("A").Ref()},
				{value: "b", version: version.Version("b"), ref: version.Ref("B").Ref()},
			},
		},
		{
			name: "ref should be moved",
			target: innerValues[string]{
				{value: "a", version: version.Version("a"), ref: nil},
				{value: "b", version: version.Version("b"), ref: version.Ref("B").Ref()},
			},
			args: args{
				ref:     version.Ref("B"),
				version: version.Version("a").Ref(),
			},
			want: innerValues[string]{
				{value: "a", version: version.Version("a"), ref: version.Ref("B").Ref()},
				{value: "b", version: version.Version("b"), ref: nil},
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
