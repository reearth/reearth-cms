package firebase

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

type FirebaseAuth struct {
	projectID      string
	client         *http.Client
	apiKey         string
	token          string
	expireAt       time.Time
	lock           sync.Mutex
	current        func() time.Time
	disableLogging bool
}

func currentTime() time.Time {
	return time.Now()
}

type firebaseResponse struct {
	IDToken      string `json:"idToken"`
	Email        string `json:"email"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    string `json:"expiresIn"`
	LocalID      string `json:"localId"`
	Err          *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (u firebaseResponse) Into() accountgateway.AuthenticatorUser {
	return accountgateway.AuthenticatorUser{
		ID:    u.LocalID,
		Email: u.Email,
	}
}

func (u firebaseResponse) Error() string {
	if u.Err != nil {
		return u.Err.Message
	}
	return ""
}

func New(projectID, apiKey string) *FirebaseAuth {
	return &FirebaseAuth{
		projectID: projectID,
		apiKey:    apiKey,
	}
}

func (f *FirebaseAuth) UpdateUser(ctx context.Context, p accountgateway.AuthenticatorUpdateUserParam) (data accountgateway.AuthenticatorUser, err error) {
	err = f.updateToken()
	if err != nil {
		return
	}

	payload := map[string]interface{}{}
	if p.Email != nil {
		payload["email"] = *p.Email
	}
	if p.Password != nil {
		payload["password"] = *p.Password
	}
	if len(payload) == 0 {
		err = rerror.NewE(i18n.T("nothing is updated"))
		return
	}

	payload["idToken"] = f.token

	var r firebaseResponse
	r, err = f.exec(http.MethodPost, "v1/accounts:update", payload)
	if err != nil {
		if !f.disableLogging {
			log.Errorf("firebaseauth: update user: %+v", err)
		}
		err = rerror.NewE(i18n.T("failed to update user"))
		return
	}

	data = r.Into()
	return
}

func (f *FirebaseAuth) needsFetchToken() bool {
	if f == nil {
		return false
	}
	if f.current == nil {
		f.current = currentTime
	}
	return f.expireAt.IsZero() || f.expireAt.Sub(f.current()) <= time.Hour
}

func (f *FirebaseAuth) updateToken() error {
	if f == nil || !f.needsFetchToken() {
		return nil
	}

	if f.apiKey == "" || f.projectID == "" {
		return rerror.NewE(i18n.T("firebaseauth is not set up"))
	}

	f.lock.Lock()
	defer f.lock.Unlock()

	if !f.needsFetchToken() {
		return nil
	}

	r, err := f.exec(http.MethodPost, "v1/accounts:signInWithPassword", map[string]string{
		"email":             f.projectID,
		"password":          f.apiKey,
		"returnSecureToken": "true",
	})
	if err != nil {
		if !f.disableLogging {
			log.Errorf("firebaseauth: access token error: %+v", err)
		}
		return rerror.NewE(i18n.T("failed to auth"))
	}

	if f.current == nil {
		f.current = currentTime
	}

	if r.IDToken == "" {
		if !f.disableLogging {
			log.Errorf("firebaseauth: no token: %+v", r)
		}
		return rerror.NewE(i18n.T("failed to auth"))
	}
	expiresIn, err := time.ParseDuration(r.ExpiresIn + "s")
	if err != nil {
		return err
	}
	f.token = r.IDToken
	f.expireAt = f.current().Add(expiresIn)

	return nil
}

func (f *FirebaseAuth) exec(method, path string, b interface{}) (r firebaseResponse, err error) {
	if f == nil || f.apiKey == "" {
		err = rerror.NewE(i18n.T("firebaseauth: API key is not set"))
		return
	}
	if f.client == nil {
		f.client = http.DefaultClient
	}

	var body io.Reader = nil
	if b != nil {
		if b2, ok := b.([]byte); ok {
			body = bytes.NewReader(b2)
		} else {
			var b2 []byte
			b2, err = json.Marshal(b)
			if err != nil {
				return
			}
			body = bytes.NewReader(b2)
		}
	}

	var req *http.Request
	req, err = http.NewRequest(method, "https://identitytoolkit.googleapis.com/"+path+"?key="+f.apiKey, body)
	if err != nil {
		return
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := f.client.Do(req)
	if err != nil {
		return
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	respb, err := io.ReadAll(resp.Body)
	if err != nil {
		return
	}

	if !f.disableLogging {
		log.Infof("firebaseauth: path: %s, status: %d, resp: %s", path, resp.StatusCode, respb)
	}

	if err = json.Unmarshal(respb, &r); err != nil {
		return
	}

	if resp.StatusCode >= 300 {
		err = errors.New(r.Error())
		return
	}
	return
}
