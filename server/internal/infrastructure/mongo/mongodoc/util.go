package mongodoc

import "go.mongodb.org/mongo-driver/bson"

func AppendE(f interface{}, elements ...bson.E) interface{} {
	switch f2 := f.(type) {
	case bson.D:
		for _, e := range elements {
			f2 = append(f2, e)
		}
		return f2
	case bson.M:
		f3 := make(bson.M, len(f2))
		for k, v := range f2 {
			f3[k] = v
		}
		for _, e := range elements {
			f3[e.Key] = e.Value
		}
		return f3
	}
	return f
}

func getE(f interface{}, k string) interface{} {
	switch g := f.(type) {
	case bson.D:
		for _, e := range g {
			if e.Key == k {
				return e.Value
			}
		}
	case bson.M:
		return g[k]
	}
	return nil
}

func appendI(f any, elements ...any) any {
	switch f2 := f.(type) {
	case []bson.D:
		res := make([]any, 0, len(f2))
		for _, e := range f2 {
			res = append(res, e)
		}
		return append(res, elements...)
	case []bson.M:
		res := make([]any, 0, len(f2)+len(elements))
		for _, e := range f2 {
			res = append(res, e)
		}
		return append(res, elements...)
	case bson.A:
		res := make([]any, 0, len(f2)+len(elements))
		return append(res, append(f2, elements...)...)
	case []any:
		res := make([]any, 0, len(f2)+len(elements))
		return append(res, append(f2, elements...)...)
	}
	return f
}

func And(filter interface{}, key string, f interface{}) interface{} {
	if f == nil {
		return filter
	}
	if g, ok := f.(bson.M); ok && g == nil {
		return filter
	}
	if g, ok := f.(bson.D); ok && g == nil {
		return filter
	}
	if g, ok := f.(bson.A); ok && g == nil {
		return filter
	}
	if g, ok := f.([]interface{}); ok && g == nil {
		return filter
	}
	if g, ok := f.([]bson.M); ok && g == nil {
		return filter
	}
	if g, ok := f.([]bson.D); ok && g == nil {
		return filter
	}
	if g, ok := f.([]bson.A); ok && g == nil {
		return filter
	}

	if key != "" && getE(filter, key) != nil {
		return filter
	}
	var g interface{}
	if key == "" {
		g = f
	} else {
		g = bson.M{key: f}
	}
	if getE(filter, "$or") != nil {
		return bson.M{
			"$and": []interface{}{filter, g},
		}
	}
	if and := getE(filter, "$and"); and != nil {
		return bson.M{
			"$and": appendI(and, g),
		}
	}
	if key == "" {
		return bson.M{
			"$and": []interface{}{filter, g},
		}
	}
	return AppendE(filter, bson.E{Key: key, Value: f})
}
