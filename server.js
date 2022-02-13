const express = require('express');
const compression = require('compression');

const app = express();
require('dotenv').config();

app.use(compression());

console.log(process.env);

app.use((req, res, next) => {
    if (
        !req.secure &&
        req.headers['x-forwarded-proto'] != 'https' &&
        process.env.NODE_ENV !== 'development'
    ) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

app.use(express.static('./public'));

const port = process.env.PORT || 1000;
app.listen(port, () => {
    console.log(`Now listening on port ${port}.`);
});
