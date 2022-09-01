package repo

import (
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/usecasex"
)

type Container struct {
	Asset       Asset
	Lock        Lock
	User        User
	Workspace   Workspace
	Project     Project
	Model       Model
	Schema      Schema
	Transaction usecasex.Transaction
}

var (
	ErrOperationDenied = errors.New("operation denied")
)

func (c *Container) Filtered(workspace WorkspaceFilter) *Container {
	if c == nil {
		return c
	}
	return &Container{
		Asset:       c.Asset,
		Lock:        c.Lock,
		Transaction: c.Transaction,
		Workspace:   c.Workspace,
		User:        c.User,
		Project:     c.Project.Filtered(workspace),
		Model:       c.Model,
		Schema:      c.Schema,
	}
}

type WorkspaceFilter struct {
	Readable user.WorkspaceIDList
	Writable user.WorkspaceIDList
}

func WorkspaceFilterFromOperator(o *usecase.Operator) WorkspaceFilter {
	return WorkspaceFilter{
		Readable: o.AllReadableWorkspaces(),
		Writable: o.AllWritableWorkspaces(),
	}
}

func (f WorkspaceFilter) Clone() WorkspaceFilter {
	return WorkspaceFilter{
		Readable: f.Readable.Clone(),
		Writable: f.Writable.Clone(),
	}
}

func (f WorkspaceFilter) Merge(g WorkspaceFilter) WorkspaceFilter {
	var r, w user.WorkspaceIDList
	if f.Readable != nil || g.Readable != nil {
		if f.Readable == nil {
			r = g.Readable.Clone()
		} else {
			r = append(f.Readable, g.Readable...)
		}
	}
	if f.Writable != nil || g.Writable != nil {
		if f.Writable == nil {
			w = g.Writable.Clone()
		} else {
			w = append(f.Writable, g.Writable...)
		}
	}
	return WorkspaceFilter{
		Readable: r,
		Writable: w,
	}
}

func (f WorkspaceFilter) CanRead(id user.WorkspaceID) bool {
	return f.Readable == nil || f.Readable.Has(id) || f.CanWrite(id)
}

func (f WorkspaceFilter) CanWrite(id user.WorkspaceID) bool {
	return f.Writable == nil || f.Writable.Has(id)
}

type ProjectFilter struct {
	Readable user.ProjectIDList
	Writable user.ProjectIDList
}

func ProjectFilterFromOperator(o *usecase.Operator) ProjectFilter {
	return ProjectFilter{
		Readable: o.AllReadableProjects(),
		Writable: o.AllWritableProjects(),
	}
}

func (f ProjectFilter) Clone() ProjectFilter {
	return ProjectFilter{
		Readable: f.Readable.Clone(),
		Writable: f.Writable.Clone(),
	}
}

func (f ProjectFilter) Merge(g ProjectFilter) ProjectFilter {
	var r, w user.ProjectIDList
	if f.Readable != nil || g.Readable != nil {
		if f.Readable == nil {
			r = g.Readable.Clone()
		} else {
			r = append(f.Readable, g.Readable...)
		}
	}
	if f.Writable != nil || g.Writable != nil {
		if f.Writable == nil {
			w = g.Writable.Clone()
		} else {
			w = append(f.Writable, g.Writable...)
		}
	}
	return ProjectFilter{
		Readable: r,
		Writable: w,
	}
}

func (f ProjectFilter) CanRead(id user.ProjectID) bool {
	return f.Readable == nil || f.Readable.Has(id) || f.CanWrite(id)
}

func (f ProjectFilter) CanWrite(id user.ProjectID) bool {
	return f.Writable == nil || f.Writable.Has(id)
}
