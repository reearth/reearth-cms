package job

type Progress struct {
	processed int
	total     int
}

func NewProgress(processed, total int) Progress {
	return Progress{
		processed: processed,
		total:     total,
	}
}

func (p Progress) Processed() int {
	return p.processed
}

func (p Progress) Total() int {
	return p.total
}

func (p Progress) Percentage() float64 {
	if p.total == 0 {
		return 0
	}
	return float64(p.processed) / float64(p.total) * 100
}

func (p Progress) Clone() Progress {
	return Progress{
		processed: p.processed,
		total:     p.total,
	}
}
