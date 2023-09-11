// eslint-disable-next-line @typescript-eslint/no-var-requires
const demoMiddleware = require('./demo/demo-middleware');

// eslint-disable-next-line no-undef
module.exports = (req, res, next) => {

    if (req.url.startsWith('/demo')) demoMiddleware(req, res);
    if (req.url.startsWith('/dummy')) req.method = 'GET';
    setTimeout(() => next(), 2000);
    // next();
};
