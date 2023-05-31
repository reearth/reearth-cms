package http

import (
	"encoding/json"
	"net/http"
)
 
type RequestType string
 
const (
	SubscriptionConfirmation RequestType = "SubscriptionConfirmation"
	Notification             RequestType = "Notification"
)
 
type EventValue string
 
const (
	Upload   EventValue = "upload"
	Download EventValue = "download"
)
 
type SubscriptionConfirmationRequest struct {
	Type              RequestType
	MessageId         string
	TopicArn          string
	Message           string
	Timestamp         string
	SignatureVersion  string
	SigningCertURL    string
	SubscribeURL      string
	Token             string
	MessageAttributes MessageAttribute
}
 
type NotificationRequest struct {
	Type              RequestType
	MessageId         string
	TopicArn          string
	Message           string
	Timestamp         string
	SignatureVersion  string
	SigningCertURL    string
	MessageAttributes MessageAttribute
}
 
type MessageAttribute struct {
	Event Event
}
 
type Event struct {
	Type  string
	Value EventValue
}
 
func (s *SubscriptionConfirmationRequest) Bind(r *http.Request) error {
	return json.NewDecoder(r.Body).Decode(s)
}
 
func (n *NotificationRequest) Bind(r *http.Request) error {
	return json.NewDecoder(r.Body).Decode(n)
}