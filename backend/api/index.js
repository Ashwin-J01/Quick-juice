const app = require('../server');

// Vercel's Node.js serverless functions expect a handler-style export.
// We'll use `serverless-http` to adapt Express -> Vercel. However, Vercel's
// Node runtime can also accept an exported function (req, res) => app(req, res).
// For simplicity and to avoid adding a dependency, export a simple wrapper.

module.exports = (req, res) => {
  // Forward request to the Express app
  app(req, res);
};
