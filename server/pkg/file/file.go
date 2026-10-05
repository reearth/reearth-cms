package file

import (
	"context"
	"errors"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"net"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"time"

	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

// isPrivateIP returns true for IPs that must not be reached via user-supplied URLs:
// loopback, link-local, RFC-1918 private ranges, and the AWS IMDS address.
func isPrivateIP(ip net.IP) bool {
	private := []net.IPNet{
		{IP: net.ParseIP("10.0.0.0"), Mask: net.CIDRMask(8, 32)},
		{IP: net.ParseIP("172.16.0.0"), Mask: net.CIDRMask(12, 32)},
		{IP: net.ParseIP("192.168.0.0"), Mask: net.CIDRMask(16, 32)},
		{IP: net.ParseIP("169.254.0.0"), Mask: net.CIDRMask(16, 32)}, // link-local / AWS IMDS
		{IP: net.ParseIP("127.0.0.0"), Mask: net.CIDRMask(8, 32)},   // loopback
		{IP: net.ParseIP("::1"), Mask: net.CIDRMask(128, 128)},       // IPv6 loopback
		{IP: net.ParseIP("fc00::"), Mask: net.CIDRMask(7, 128)},      // IPv6 ULA
	}
	for _, block := range private {
		if block.Contains(ip) {
			return true
		}
	}
	return false
}

var ssrfSafeDialer = &net.Dialer{Timeout: 30 * time.Second}

// urlFetchClient enforces a hard timeout on user-supplied URL fetches and
// blocks connections to private/reserved IP addresses (SSRF mitigation).
var urlFetchClient = &http.Client{
	Timeout: 5 * time.Minute,
	Transport: &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			host, port, err := net.SplitHostPort(addr)
			if err != nil {
				return nil, fmt.Errorf("ssrf: invalid address %q: %w", addr, err)
			}
			ips, err := net.DefaultResolver.LookupHost(ctx, host)
			if err != nil {
				return nil, fmt.Errorf("ssrf: DNS lookup failed for %q: %w", host, err)
			}
			for _, ipStr := range ips {
				if ip := net.ParseIP(ipStr); ip != nil && isPrivateIP(ip) {
					return nil, fmt.Errorf("ssrf: request to private/reserved IP %s is blocked", ipStr)
				}
			}
			return ssrfSafeDialer.DialContext(ctx, network, net.JoinHostPort(ips[0], port))
		},
	},
}

type File struct {
	Content         io.ReadCloser
	Name            string
	Size            int64
	ContentType     string
	ContentEncoding string
}

func FromMultipart(multipartReader *multipart.Reader, formName string) (*File, error) {
	if formName == "" {
		formName = "file"
	}

	for {
		p, err := multipartReader.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		if p.FormName() != formName {
			if err := p.Close(); err != nil {
				return nil, err
			}
			continue
		}

		return &File{
			Content:     p,
			Name:        p.FileName(),
			Size:        0,
			ContentType: p.Header.Get("Content-Type"),
		}, nil
	}

	return nil, rerror.NewE(i18n.T("file not found"))
}

func FromURL(ctx context.Context, rawURL string) (*File, error) {
	URL, err := url.Parse(rawURL)
	if err != nil {
		return nil, err
	}

	// Reject non-HTTP(S) schemes to prevent file://, ftp://, gopher://, etc.
	if URL.Scheme != "http" && URL.Scheme != "https" {
		return nil, fmt.Errorf("unsupported URL scheme %q: only http and https are allowed", URL.Scheme)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, URL.String(), nil)
	if err != nil {
		return nil, errors.New("failed to request")
	}

	// TODO: support gzip
	// req.Header.Set("Accept-Encoding", "gzip")

	res, err := urlFetchClient.Do(req)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	if res.StatusCode > 300 {
		return nil, rerror.ErrInternalBy(fmt.Errorf("status code is %d", res.StatusCode))
	}

	ct := res.Header.Get("Content-Type")
	ce := res.Header.Get("Content-Encoding")
	if ce != "" && ce != "gzip" {
		return nil, fmt.Errorf("unsupported content encoding: %s", ce)
	}
	fs, _ := strconv.ParseInt(res.Header.Get("Content-Length"), 10, 64)

	fn := path.Base(URL.Path)
	_, m, err := mime.ParseMediaType(res.Header.Get("Content-Disposition"))
	if err == nil && m["filename"] != "" {
		fn = m["filename"]
	}

	return &File{
		Content:         res.Body,
		Name:            fn,
		ContentType:     ct,
		ContentEncoding: ce,
		Size:            fs,
	}, nil
}
