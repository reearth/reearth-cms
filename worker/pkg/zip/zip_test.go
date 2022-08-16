package zip

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testFilePrefix = "test"

func TestUnzip(t *testing.T) {
	type args struct {
		src  string
		dest string
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "success",
			args: args{
				src:  "./test.zip",
				dest: "./",
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			defer cleanUp()
			_, err := prepareZipFor()
			require.NoError(t, err)
			if err := Unzip(tt.args.src, tt.args.dest); (err != nil) != tt.wantErr {
				t.Errorf("Unzip() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

var fileContent = "Hello"

//ダミーファイルを作成
func createDummyFiles(fileNames ...string) {
	for _, f := range fileNames {
		f, err := os.Create(f)
		defer f.Close()
		if err != nil {
			panic(err)
		}
		if _, err = f.Write([]byte(f.Name() + fileContent)); err != nil {
			panic(err)
		}
	}
}

// 指定されたファイルからZipを作成(メモリ上)
func compress(fileNames []string) *bytes.Buffer {
	b := new(bytes.Buffer)
	w := zip.NewWriter(b)
	defer w.Close()

	for _, file := range fileNames {
		info, _ := os.Stat(file)

		hdr, _ := zip.FileInfoHeader(info)
		hdr.Name = "files/" + file
		f, err := w.CreateHeader(hdr)
		if err != nil {
			panic(err)
		}

		body, err := ioutil.ReadFile(file)
		if err != nil {
			panic(err)
		}
		if _, err := f.Write(body); err != nil {
			panic(err)
		}
	}
	return b
}

// save メモリ上の保存されたzipをファイルシステムに保存
func save(name string, b *bytes.Buffer) (*os.File, error) {
	zf, err := os.Create(name)
	// defer zf.Close()
	if err != nil {
		return nil, err
	}
	_, err = zf.Write(b.Bytes())
	if err != nil {
		return nil, err
	}
	return zf, nil
}

func getFileNames(fileNum int64) []string {
	var fileNames = []string{}
	for i := 0; i < int(fileNum); i++ {
		fileNames = append(fileNames, testFilePrefix+strconv.Itoa(i)+".txt")
	}
	return fileNames
}

// prepareZipFor 複数ファイルを作成し、Zipファイルを保存する
func prepareZipFor() (*os.File, error) {
	fileNames := getFileNames(3)
	createDummyFiles(fileNames...)
	b := compress(fileNames)
	zf, err := save(testFilePrefix+".zip", b)
	if err != nil {
		return nil, err
	}
	return zf, nil
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
	zf, err := prepareZipFor()
	defer cleanUp()
	require.NoError(t, err)

	fInfo, err := zf.Stat()
	require.NoError(t, err)

	wFn := func(name string) io.Writer {
		return new(bytes.Buffer)
	}
	_, err = NewUnzipper(zf, fInfo.Size(), wFn)
	assert.NoError(t, err)

}

func TestUnzipper_Unzip(t *testing.T) {
	tests := []struct {
		name      string
		prepareFn func() (*os.File, fs.FileInfo)
		wantErr   bool
	}{
		{
			name: "success",
			prepareFn: func() (*os.File, fs.FileInfo) {
				zf, err := prepareZipFor()
				defer cleanUp()
				if err != nil {
					panic(err)
				}

				fInfo, err := zf.Stat()
				if err != nil {
					panic(err)
				}
				return zf, fInfo
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			zf, fInfo := tt.prepareFn()

			//map of buffers which will keep expected data
			fileNames := getFileNames(3)
			expectedFiles := make(map[string]*bytes.Buffer)
			for _, f := range fileNames {
				expectedFiles[f] = new(bytes.Buffer)
			}
			wFn := func(name string) io.Writer {
				return expectedFiles[name]
			}
			uz, err := NewUnzipper(zf, fInfo.Size(), wFn)
			require.NoError(t, err)

			err = uz.Unzip()
			assert.NoError(t, err)
			for k, v := range expectedFiles {
				fmt.Print(string(v.Bytes()))
				assert.Equal(t, string(v.Bytes()), k+fileContent)
			}

		})
	}
}
