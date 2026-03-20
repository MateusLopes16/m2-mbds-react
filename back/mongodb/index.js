const mongoose = require('mongoose');
const router = require('./routes');
const { corsMiddleware } = require('./middleware');

const path = __dirname + '/';

// Connexion à MongoDB
mongoose.connect('mongodb://root:password@localhost:27017/games?authSource=admin')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    });

app.use(express.json());
app.use(corsMiddleware);

app.use('/', router);

const api = require(path + './api');
app.use('/api', api);

const { errorHandler } = require('./middleware');
app.use(errorHandler);

const port = 8085;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});