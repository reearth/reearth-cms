package model

type Direction string

const (
	DirectionAsc  Direction = "ASC"
	DirectionDesc Direction = "DESC"
)

type Column string

const (
	ColumnCreatedAt Column = "CREATED_AT"
	ColumnUpdatedAt Column = "UPDATED_AT"
	ColumnOrder     Column = "ORDER"
)

type Sort struct {
	Column    Column
	Direction Direction
}
