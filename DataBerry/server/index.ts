import 'dotenvconfig'
import express, { Express, Request, Response, NextFunction } from 'express';
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
    const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;
        
          const originalResJson = res.json;
            res.json = function (bodyJson, ...args) {
                capturedJsonResponse = bodyJson;
                    return originalResJson.apply(res, [bodyJson, ...args]);
                      };

                        res.on("finish", () => {
                            const duration = Date.now() - start;
                                if (path.startsWith("/api")) {
                                      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
                                            if (capturedJsonResponse) {
                                                    logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
                                                          }

                                                                if (logLine.length > 80) {
                                                                        logLine = logLine.slice(0, 79) + "…";
                                                                              }

                                                                                    log(logLine);
                                                                                        }
                                                                                          });

                                                                                            next();
                                                                                            });

(async () => {
  try {
    const server = await registerRoutes(app);

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get('env') === 'development') {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Error handler should be the last middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';

      log(`Error: ${err.message}`, "error");
      console.error(err.stack); // Log the full stack trace for debugging
      res.status(status).json({ message });
    });

    const port = parseInt(process.env.PORT || '8080', 10);

    // Add graceful shutdown for production environments
    process.on('SIGTERM', () => {
      log('SIGTERM signal received: closing HTTP server', 'lifecycle');
      server.close(() => {
        log('HTTP server closed', 'lifecycle');
        process.exit(0);
      });
    });

    server.listen({ port, host: '0.0.0.0', reusePort: false }, () => {
      log(`serving on port ${port}`);

      // For Google Cloud Run, also log readiness
      if (process.env.NODE_ENV === 'production') {
        console.log(`Server is ready and listening on 0.0.0.0:${port}`);
        console.log(`Health check available at http://0.0.0.0:${port}/api/health`);
      }
    });
  } catch (err: any) {
    log(`Failed to start server: ${err.message}`, 'startup');
    console.error(err.stack);
    process.exit(1);
  }
})();
