package version

type VersionOrRef struct {
	version Version
	ref     Ref
}

func (vr VersionOrRef) IsZero() bool {
	return vr == VersionOrRef{}
}

func (vr VersionOrRef) Match(v func(v Version), r func(r Ref)) {
	_ = MatchVersionOrRef(vr, func(version Version) any {
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

func MatchVersionOrRef[T any](vr VersionOrRef, v func(v Version) T, r func(r Ref) T) (_ T) {
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
