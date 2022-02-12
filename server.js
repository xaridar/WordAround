const express = require('express');

const app = express();

app.use((req, res, next) => {
    if (
        !req.secure &&
        req.get('x-forwarded-proto') !== 'https' &&
        process.env.NODE_ENV === 'production'
    ) {
        console.log(req.hostname);
        next();
        // return res.redirect(`https://${req.hostname}${req.url}`);
    }
});

app.use(express.static('./public', { extensions: 'html' }));

const port = process.env.PORT || 1000;
app.listen(port, () => {
    console.log(`Now listening on port ${port}.`);
});
