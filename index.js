const morgan = require('morgan');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const redis = require('ioredis');
const session = require('express-session');
const {
	MONGO_USER,
	MONGO_PASSWORD,
	MONGO_IP,
	MONGO_PORT,
	REDIS_URL,
	SESSION_SECRET,
	REDIS_PORT
} = require('./config/config');
const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');

let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient({ host: REDIS_URL, port: REDIS_PORT });

const PORT = process.env.PORT || 3000;

(async () => {
	const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
	await mongoose
		.connect(mongoURL, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		.then(() => {
			console.log('Successfully connected to DB...');

			const app = express();

			app.enable('trust proxy');

			app.use(morgan('dev'));

			app.use(cors());

			app.use(
				session({
					store: new RedisStore({ client: redisClient }),
					secret: SESSION_SECRET,
					resave: false,
					saveUninitialized: true,
					cookie: {
						secure: false,
						httpOnly: true,
						maxAge: parseInt(1000 * 60) // 30 seconds
					}
				})
			);

			app.use(express.json());
			app.use(express.urlencoded({ extended: true }));

			app.get('/api/v1', (req, res) => {
				console.log('Yeah, it ran...');
				res.send('<h2>hey there</h2>');
			});

			app.use('/api/v1/posts', postRouter);
			app.use('/api/v1/users', userRouter);

			app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
		})
		.catch((error) => {
			console.log(`Failed to connect to DB due to ${error}`);
		});
})();
