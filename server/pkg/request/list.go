package request

type List []*Request

func (l List) CloseAll() {
	for _, request := range l {
		request.SetState(StateClosed)
	}
}
