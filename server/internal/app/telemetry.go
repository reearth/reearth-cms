package app

import (
	"context"
	"os"
	"time"

	texporter "github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace"
	"github.com/reearth/reearthx/log"
	"go.opentelemetry.io/contrib/detectors/gcp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

const serviceName = "reearth-cms"

// initTelemetry sets up the OpenTelemetry TracerProvider from OtelConfig.
//
// Exporter selection (in order):
//  1. GOOGLE_CLOUD_PROJECT env var set → Cloud Trace
//  2. config.Endpoint set              → OTLP HTTP (e.g. Jaeger)
//  3. Neither                          → no-op
//
// Returns a shutdown function that must be deferred by the caller.
func initTelemetry(ctx context.Context, config OtelConfig) func() {
	if !config.Enabled {
		log.Infof("otel: disabled, skipping telemetry initialization")
		return func() {}
	}

	exporter, label, err := buildExporter(ctx, config)
	if err != nil {
		log.Warnf("otel: failed to create exporter: %v", err)
		return func() {}
	}
	if exporter == nil {
		log.Infof("otel: no exporter configured, skipping telemetry initialization")
		return func() {}
	}

	res, err := resource.New(ctx,
		resource.WithDetectors(gcp.NewDetector()),
		resource.WithAttributes(semconv.ServiceName(serviceName)),
	)
	if err != nil {
		log.Warnf("otel: failed to create resource: %v", err)
		res = resource.Default()
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter, batcherOptions(config)...),
		sdktrace.WithResource(res),
		sdktrace.WithSampler(sampler(config)),
	)

	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))

	log.Infof("otel: initialized with %s exporter", label)

	return func() {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := tp.Shutdown(shutdownCtx); err != nil {
			log.Warnf("otel: shutdown error: %v", err)
		}
		log.Infof("otel: exporter shutdown")
	}
}

func buildExporter(ctx context.Context, config OtelConfig) (sdktrace.SpanExporter, string, error) {
	if project := os.Getenv("GOOGLE_CLOUD_PROJECT"); project != "" {
		exp, err := texporter.New(texporter.WithProjectID(project))
		return exp, "Google Cloud Trace (project=" + project + ")", err
	}

	if config.Endpoint != "" {
		exp, err := otlptracehttp.New(ctx, otlptracehttp.WithEndpointURL(config.Endpoint))
		return exp, "OTLP HTTP (" + config.Endpoint + ")", err
	}

	return nil, "", nil
}

func sampler(config OtelConfig) sdktrace.Sampler {
	if config.SamplingRatio <= 0 {
		return sdktrace.NeverSample()
	}
	if config.SamplingRatio >= 1 {
		return sdktrace.AlwaysSample()
	}
	return sdktrace.ParentBased(sdktrace.TraceIDRatioBased(config.SamplingRatio))
}

func batcherOptions(config OtelConfig) []sdktrace.BatchSpanProcessorOption {
	var opts []sdktrace.BatchSpanProcessorOption
	if config.MaxExportBatchSize > 0 {
		opts = append(opts, sdktrace.WithMaxExportBatchSize(config.MaxExportBatchSize))
	}
	if config.BatchTimeout > 0 {
		opts = append(opts, sdktrace.WithBatchTimeout(config.BatchTimeout))
	}
	if config.MaxQueueSize > 0 {
		opts = append(opts, sdktrace.WithMaxQueueSize(config.MaxQueueSize))
	}
	return opts
}
