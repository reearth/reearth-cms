package decompressor

// type Config struct {
// 	BucketName string `envconfig:"GCS_BUCKET_NAME"`
// }
//
// func ReadDecompressorConfig() (*Config, error) {
// 	if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
// 		return nil, err
// 	} else if err == nil {
// 		log.Infof("config: .env loaded for decompressor")
// 	}
//
// 	var c Config
// 	err := envconfig.Process(configPrefix, &c)
//
// 	return &c, err
// }
