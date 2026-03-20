const Boom = require('@hapi/boom');

const corsMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
};

const articleValidations = (req, res, next) => {
    console.log('Validating request:', req.method, req.path, req.body);
    if (req.method === 'POST' && req.path === '/articles') {
        const { title, content, image } = req.body || {};

        if (!title || typeof title !== 'string' || title.length < 3) {
            console.log('Invalid title:', title);
            throw Boom.badRequest('Title must be at least 3 characters long');
        }
        if (!content || typeof content !== 'string' || content.length < 10) {
            console.log('Invalid content:', content);
            throw Boom.badRequest('Content must be at least 10 characters long');
        }
        if (image && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(image)) {
            throw Boom.badRequest('Image must be a valid URL ending with .jpg, .jpeg, .png, or .gif');
        }
    }
    next();
};

const errorHandler = (err, req, res, next) => {
    if (Boom.isBoom(err)) {
        const { output } = err;
        return res.status(output.statusCode).json(output.payload);
    }

    // Log server errors for debugging
    console.error(err);
    const internal = Boom.internal('Internal server error');
    return res.status(internal.output.statusCode).json(internal.output.payload);
};

module.exports = {
    corsMiddleware,
    articleValidations,
    errorHandler
};