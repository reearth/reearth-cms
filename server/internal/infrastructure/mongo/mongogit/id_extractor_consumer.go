package mongogit

import (
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

type documentID struct {
	ID string `bson:"__id"`
}

type idExtractorConsumer struct {
	Result []string
	o      mongox.Consumer
	c      mongox.SimpleConsumer[documentID]
}

func (s *idExtractorConsumer) Consume(raw bson.Raw) error {
	if s.c == nil {
		s.c = func(data documentID) error {
			s.Result = append(s.Result, data.ID)
			return nil
		}
	}
	if err := s.c.Consume(raw); err != nil {
		return err
	}
	return s.o.Consume(raw)
}

func (s *idExtractorConsumer) IDs() []string {
	return s.Result
}

func newIdExtractorConsumer(c mongox.Consumer) *idExtractorConsumer {
	return &idExtractorConsumer{
		o:      c,
		Result: []string{},
	}
}
