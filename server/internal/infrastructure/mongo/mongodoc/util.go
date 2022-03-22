package mongodoc

import "go.mongodb.org/mongo-driver/bson"

func appendE(f interface{}, elements ...bson.E) interface{} {
	switch f2 := f.(type) {
	case bson.D:
		for _, e := range elements {
			f2 = append(f2, e)
		}
		return f2
	case bson.M:
		for _, e := range elements {
			f2[e.Key] = e.Value
		}
		return f2
	}
	return f
}
