const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const Routing = require("./routes/index")
const { logger, interpret } = require('./middleware');
const app = express();
require('dotenv').config()
app.listen(process.env.PORT_NUMBER, () => {
    logger.log({
        level: 'info',
        meta: {
            name: 'Application start running successfully',
            details: JSON.stringify([{ type: 'Nodejs Application', code: 200, message: `Nodejs application is running on port ${process.env.PORT_NUMBER}` }]),
        },
    });
});

try {
    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use("/api/v1/", interpret, new Routing(express.Router()).Routed())
    app.all('/*', (req, res) => res.status(404).json({ msg: 'Route does not exits' }));
} catch (exception) {
    const { code, name, message } = exception;

    logger.log({
        level: 'error',
        meta: {
            name: 'unexpected-internal-server-error',
            details: JSON.stringify([{ type: name, code, message }]),
        },
    });

    // eslint-disable-next-line no-process-exit
    process.exit(0);
}

