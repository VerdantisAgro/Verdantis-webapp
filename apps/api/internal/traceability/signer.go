package traceability

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"fmt"
)

// Signer signs certificates with an Ed25519 key.
type Signer struct {
	priv ed25519.PrivateKey
}

// NewSigner builds a signer from a 32-byte seed, or a random key when seed is nil.
func NewSigner(seed []byte) (*Signer, error) {
	if seed == nil {
		_, priv, err := ed25519.GenerateKey(rand.Reader)
		if err != nil {
			return nil, err
		}
		return &Signer{priv: priv}, nil
	}
	if len(seed) != ed25519.SeedSize {
		return nil, fmt.Errorf("seed must be %d bytes", ed25519.SeedSize)
	}
	return &Signer{priv: ed25519.NewKeyFromSeed(seed)}, nil
}

// certificateMessage binds the signature to the code printed on the QR.
func certificateMessage(code, finalHash string) []byte {
	return []byte("verdantis:" + version + ":certificate:" + code + ":" + finalHash)
}

func (s *Signer) Sign(code, finalHash string) string {
	return base64.StdEncoding.EncodeToString(ed25519.Sign(s.priv, certificateMessage(code, finalHash)))
}

func (s *Signer) Verify(code, finalHash, signature string) bool {
	sig, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		return false
	}
	return ed25519.Verify(s.PublicKey(), certificateMessage(code, finalHash), sig)
}

func (s *Signer) PublicKey() ed25519.PublicKey {
	return s.priv.Public().(ed25519.PublicKey)
}

func (s *Signer) PublicKeyBase64() string {
	return base64.StdEncoding.EncodeToString(s.PublicKey())
}
