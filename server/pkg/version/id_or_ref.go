package version

type IDOrRef struct {
	version ID
	ref     Ref
}

func (vr IDOrRef) Ref() *IDOrRef {
	return &vr
}

func (vr IDOrRef) IsZero() bool {
	return vr == IDOrRef{}
}

func (vr IDOrRef) IsRef(ref Ref) bool {
	return MatchVersionOrRef(vr, nil, func(r Ref) bool { return r == ref })
}

func (vr IDOrRef) IsSpecialRef() bool {
	return MatchVersionOrRef(vr, nil, func(r Ref) bool { return r.IsSpecial() })
}

func (vr IDOrRef) Match(v func(v ID), r func(r Ref)) {
	_ = MatchVersionOrRef(vr, func(version ID) any {
		if v != nil {
			v(version)
		}
		return nil
	}, func(ref Ref) any {
		if r != nil {
			r(ref)
		}
		return nil
	})
}

func MatchVersionOrRef[T any](vr IDOrRef, v func(v ID) T, r func(r Ref) T) (_ T) {
	if vr.version != Zero {
		if v != nil {
			return v(vr.version)
		}
	} else if vr.ref != "" {
		if r != nil {
			return r(vr.ref)
		}
	}
	return
}
