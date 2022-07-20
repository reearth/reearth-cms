package usecase

type Decompresser interface {
	Match(Cases)
}

type Zip struct{}

type Cases struct {
	Zip func(Zip) error
}

func (Zip) Match(c Cases) error {
	return nil
}
