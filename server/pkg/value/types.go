package value

var types = map[Type]TypeDef{
	TypeAsset:     &asset{},
	TypeBool:      &boolType{},
	TypeDate:      &date{},
	TypeInteger:   &integer{},
	TypeText:      &text{},
	TypeTextArea:  &text{},
	TypeRichText:  &text{},
	TypeMarkdown:  &text{},
	TypeSelect:    &selectType{},
	TypeTag:       &tag{},
	TypeReference: &reference{},
	TypeURL:       &urlType{},
}

type TypeDef interface {
	New(t any) (any, error)
}
