const express = require('express');

const app = express();

app.use(express.static('./public'));

const port = process.env.PORT || 1000;
app.listen(port, () => {
    console.log(`Now listening on port ${port}.`);
});
