// Background worker entry point — processes BullMQ jobs.
// Separated from the HTTP server so workers scale independently.

const workerName = process.env.WORKER_NAME || "default";

console.log(`[Worker] Starting worker: ${workerName}`);
console.log(`[Worker] PID: ${process.pid}`);
console.log(`[Worker] NODE_ENV: ${process.env.NODE_ENV || "development"}`);

// Queue and job definitions will be added in Phase 7 (Notifications & Reminders).
// For now, this is a placeholder that keeps the process alive for Docker health checks.
// Real workers will be registered here:
//   import "./notifications/email.worker";
//   import "./notifications/push.worker";
//   import "./scheduled/vaccine-reminders.job";

// Keep-alive — in production, BullMQ workers keep the process alive via Redis connection.
// This placeholder ensures the container doesn't exit immediately.
console.log("[Worker] Ready. Waiting for jobs...");
