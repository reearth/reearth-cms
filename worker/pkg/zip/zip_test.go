package zip

import (
	"archive/zip"
	"bytes"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
	"testing"

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
			err := prepareZipFor()
			require.NoError(t, err)
			if err := Unzip(tt.args.src, tt.args.dest); (err != nil) != tt.wantErr {
				t.Errorf("Unzip() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

//ダミーファイルを作成
func createDummyFiles(fileNames ...string) {
	for _, f := range fileNames {
		f, err := os.Create(f)
		defer f.Close()
		if err != nil {
			panic(err)
		}
		if _, err = f.Write([]byte("Hello worlds")); err != nil {
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
func save(name string, b *bytes.Buffer) error {
	zf, err := os.Create(name)
	defer zf.Close()
	if err != nil {
		return err
	}
	_, err = zf.Write(b.Bytes())
	if err != nil {
		return err
	}
	return nil
}

// prepareZipFor 複数ファイルを作成し、Zipファイルを保存する
func prepareZipFor() error {
	var fileNames = []string{}
	for i := 0; i < 3; i++ {
		fileNames = append(fileNames, testFilePrefix+strconv.Itoa(i)+".txt")
	}
	createDummyFiles(fileNames...)
	b := compress(fileNames)
	if err := save(testFilePrefix+".zip", b); err != nil {
		return err
	}
	return nil
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
