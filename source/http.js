const curry = require('lodash.curry');

const http = {
  failsafe(λ) {
    return async function safeλ(request, response) {
      try {
        await λ(request, response);
      } catch (error) {
        console.error(error);

        http.sendServerError(response);
      }
    };
  },

  sendJson: curry(function sendJson(response, results) {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');

    http.sendResponse(response, 200, JSON.stringify(results, null, 3));
  }),

  sendError(response, code) {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');

    http.sendResponse(response, code);
  },

  sendResponse(response, code, content = undefined) {
    response.statusCode = code;

    response.end(content);
  },

  sendServerError(response) {
    return http.sendError(response, 500);
  },

  sendBadRequest(response) {
    return http.sendError(response, 400);
  },

  sendNotFound(response) {
    return http.sendError(response, 404);
  }
};

module.exports = http;
