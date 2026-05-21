package project

type PostingSettings struct {
	enabled bool
}

func NewPostingSettings(enabled bool) *PostingSettings {
	return &PostingSettings{enabled: enabled}
}

func (p *PostingSettings) Enabled() bool {
	if p == nil {
		return false
	}
	return p.enabled
}

func (p *PostingSettings) Clone() *PostingSettings {
	if p == nil {
		return nil
	}
	return &PostingSettings{enabled: p.enabled}
}
