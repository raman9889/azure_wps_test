const express = require('express');
const { WebPubSubServiceClient } = require('@azure/web-pubsub');
const hubname = "reactChat";

const connectionString = process.argv[2] || process.env.WebPubSubConnectionString;
const service = new WebPubSubServiceClient(connectionString, hubname);
const port = 8080;
const app = express();

app.use(express.static("build"));
app.get('/negotiate', async (req, res) => {
    const token = await service.getClientAccessToken({userId: req.query.userId,roles: [
        "webpubsub.sendToGroup",
        "webpubsub.joinLeaveGroup"
    ]});
    console.log(token);
    res.status(200).send(token.url);
})
app.listen(port, ()=>console.log(`Open http://localhost:${port}`));