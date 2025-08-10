import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { logger } from "./logger";
import { env, isProduction } from "./environment";

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable file system instrumentation to reduce noise
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
      // Configure HTTP instrumentation
      "@opentelemetry/instrumentation-http": {
        enabled: true,
        ignoreIncomingRequestHook: (req) => {
          // Ignore health check requests
          return req.url?.includes("/health") || false;
        },
      },
      // Configure Express instrumentation
      "@opentelemetry/instrumentation-express": {
        enabled: true,
      },
    }),
  ],
});

// Start telemetry only in production or when explicitly enabled
if (isProduction || process.env.ENABLE_TELEMETRY === "true") {
  try {
    sdk.start();
    logger.info("OpenTelemetry initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize OpenTelemetry", { error });
  }
}

export { sdk };
