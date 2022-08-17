package zip

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	testFilePrefix = "test"
	fileContent    = "Hello"
)

//ダミーファイルを作成
// createDummyFiles creates dummy files with given filenames
func createDummyFiles(t *testing.T, fileNames ...string) {
	t.Helper()

	for _, f := range fileNames {
		f, err := os.Create(f)
		defer f.Close()
		if err != nil {
			t.Fatal(err)
		}
		//file content
		if _, err = f.Write([]byte(f.Name() + fileContent)); err != nil {
			t.Fatal(err)
		}
	}
}

// 指定されたファイルからZipを作成(メモリ上)
// compress compresses files and return in memory zip file
func compress(t *testing.T, fileNames []string) *bytes.Buffer {
	t.Helper()

	b := new(bytes.Buffer)
	w := zip.NewWriter(b)
	defer w.Close()

	for _, file := range fileNames {
		info, _ := os.Stat(file)

		hdr, _ := zip.FileInfoHeader(info)
		hdr.Name = "files/" + file
		f, err := w.CreateHeader(hdr)
		if err != nil {
			t.Fatal(err)
		}

		body, err := ioutil.ReadFile(file)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := f.Write(body); err != nil {
			t.Fatal(err)
		}
	}
	return b
}

// save メモリ上の保存されたzipをファイルシステムに保存
// save saves in memory buffer to file system
func save(t *testing.T, name string, b *bytes.Buffer) *os.File {
	t.Helper()
	zf, err := os.Create(name)
	if err != nil {
		t.Fatal(t)
	}
	_, err = zf.Write(b.Bytes())
	if err != nil {
		t.Fatal(t)
	}
	return zf
}

func getFileNames(fileNum int64) []string {
	var fileNames = []string{}
	for i := 0; i < int(fileNum); i++ {
		fileNames = append(fileNames, testFilePrefix+strconv.Itoa(i)+".txt")
	}
	return fileNames
}

// prepareZip 複数ファイルを作成し、Zipファイルを保存する
// prepareZip creates files, zip them and save it
func prepareZip(t *testing.T, fileNum int64) *os.File {
	fileNames := getFileNames(fileNum)
	createDummyFiles(t, fileNames...)
	b := compress(t, fileNames)
	zf := save(t, testFilePrefix+".zip", b)
	return zf
}

func cleanUp() {
	dir, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		panic(err)
	}

	for _, file := range files {
		if strings.HasPrefix(file.Name(), testFilePrefix) {
			if err := os.Remove(file.Name()); err != nil {
				panic(err)
			}
		}
	}
}

func TestNewUnzipper(t *testing.T) {
	type args struct {
		ra   io.ReaderAt
		size int64
		wFn  func(name string) io.Writer
	}
	zf := prepareZip(t, 3)
	defer cleanUp()

	fInfo, err := zf.Stat()
	require.NoError(t, err)

	wFn := func(name string) (io.Writer, error) {
		return new(bytes.Buffer), nil
	}
	_, err = NewUnzipper(zf, fInfo.Size(), wFn)
	assert.NoError(t, err)

}

func TestUnzipper_Unzip(t *testing.T) {
	var fileNum = 3
	// prepare
	zf := prepareZip(t, int64(fileNum))
	defer cleanUp()

	fInfo, err := zf.Stat()
	if err != nil {
		t.Fatal(err)
	}

	fileNames := getFileNames(int64(fileNum))

	//expected
	expectedFiles := make(map[string]*bytes.Buffer)
	for _, f := range fileNames {
		b := new(bytes.Buffer)
		_, err := b.Write([]byte(f + fileContent))
		if err != nil {
			require.NoError(t, err)
		}
		expectedFiles[f] = b
	}

	//map of buffers which will keep unzipped data
	files := make(map[string]*bytes.Buffer)
	for _, f := range fileNames {
		files[f] = new(bytes.Buffer)
	}
	wFn := func(name string) (io.Writer, error) {
		return files[name], nil
	}

	uz, err := NewUnzipper(zf, fInfo.Size(), wFn)
	require.NoError(t, err)

	err = uz.Unzip()
	assert.NoError(t, err)
	for k, v := range files {
		fmt.Printf("expected:%v, actual:%v", string(expectedFiles[k].Bytes()), string(v.Bytes()))
		assert.Equal(t, string(v.Bytes()), string(expectedFiles[k].Bytes()))
	}

}
