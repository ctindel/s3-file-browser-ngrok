const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const expressWinston = require('express-winston');
const { S3Client, ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

dotenv.config();

const app = express();
app.use(cors());
app.disable('etag');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 's3-file-browser-ngrok' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');
app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    expressFormat: true,
    colorize: true,
  })
);

const s3Client = new S3Client({ region: process.env.AWS_REGION });

app.get('/', async (req, res) => {
        res.json();
});

app.get('/list/:prefix?', async (req, res) => {
    try {
        if (req.params.prefix) {
            console.log('we got a prefix passed in');
        } else {
            console.log('we did not get a prefix passed in');
        }
        var prefix = req.params.prefix || '';
        console.log ('prefix = ' + prefix);
        if (prefix === '/') {
            prefix = ''
        }
        const listObjectsCommand = new ListObjectsCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Prefix: decodeURIComponent(prefix),
            //Prefix: prefix,
            //Prefix: 'William_Tell_Overture_Trumpets/',
            Delimiter: '/',
        });
        const response = await s3Client.send(listObjectsCommand);
        console.dir(response);
        const files = response.Contents.map(obj => ({
            id: obj.Key,
            name: obj.Key.split('/').pop(),
            isDir: false,
            size: obj.Size,
        }));
        var directories = []
        if (response.CommonPrefixes) { 
            directories = response.CommonPrefixes.map(directory => ({
                id: directory.Prefix,
                name: directory.Prefix.split('/').slice(-2, -1)[0],
                isDir: true,
            }));
        }
        res.json([...directories, ...files]);
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).json({ message: 'Failed to list files.' });
    }
});

app.get('/download/:key', async (req, res) => {
    try {
        const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: decodeURIComponent(req.params.key),
        });
        const response = await s3Client.send(getObjectCommand);
        res.setHeader('Content-Type', response.ContentType);
        res.setHeader('Content-Disposition', `attachment; filename=${req.params.key.split('/').pop()}`);
        response.Body.pipe(res);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: 'Failed to download file.' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});

