const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-grpc");
const { Resource } = require("@opentelemetry/resources");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { AlwaysOnSampler } = require("@opentelemetry/core");
const { ParentBasedSampler } = require("@opentelemetry/core");
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { SemanticResourceAttributes: ResourceAttributesSC } = require('@opentelemetry/semantic-conventions');
const { B3InjectEncoding } = require("@opentelemetry/propagator-b3");
const { B3Propagator } = require("@opentelemetry/propagator-b3");
const { W3CBaggagePropagator } = require("@opentelemetry/core");
const { W3CTraceContextPropagator } = require("@opentelemetry/core");
const { CompositePropagator } = require("@opentelemetry/core");

module.exports = { "newProvider": () => {
    const provider = new NodeTracerProvider({
        sampler: new ParentBasedSampler({root: new AlwaysOnSampler()}),
        resource: new Resource({
            [ResourceAttributesSC.SERVICE_NAME]: process.env.SERVICE || 'service', // resource example
        }),
        propagator: new CompositePropagator({
            propagators: [
                new W3CTraceContextPropagator(),
                new W3CBaggagePropagator(),
                new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
            ],
        })
    });

    const exporter = new OTLPTraceExporter({})
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
    provider.register();

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(), //should accept other instrumentations
        ],
        tracerProvider: provider
    });

    return provider;
}}