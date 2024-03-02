const axios = require("axios")
const qs = require("qs");
const Express = require("express");
const qrcode = require("qrcode-terminal");
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
var fs = require('fs'),
    request = require('request'),
    path = require("path");
    var app = Express();

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(path.join(__dirname, "images", filename))).on('close', callback);
    });
};




const client = new Client({
    puppeteer: {
        args: ['--no-sandbox'],
        //slowMo:100,
        headless: true
    },
    authStrategy: new LocalAuth({ clientId: "Client_2" }),
    // proxyAuthentication: { username: 'username', password: 'password' },
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true })
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body.startsWith("/charts")) {
        var SYMBOL = msg.body.split(" ")[1].toUpperCase()
        var INTERVAL = msg.body.split(" ")[2].toLowerCase()
        axios.get(`https://api.chart-img.com/v1/tradingview/advanced-chart/storage`, {
            headers: {
                Authorization: `Bearer {BEARER_API_KEY}`
            },
            params: {
                symbol: `BINANCE:${SYMBOL}`,
                interval: INTERVAL,
                theme: 'dark',
                timezone: "Africa/Johannesburg"
            },
            paramsSerializer: (params) => {
                return qs.stringify(params, { arrayFormat: "repeat" })
            }
        }).then((res) => {
            var filename = res.data.url.replace("https://api.chart-img.com/v1/storage/pub/", "")
            download(res.data.url, filename, function () {
                let mainDir = path.resolve(__dirname, "images", filename)
                let file = MessageMedia.fromFilePath(mainDir)
                client.sendMessage(msg.from, file);
            });

        })
    }
});

client.initialize();



app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

function logFileName(time) {
    if (!time) return 'access.log';
    return `${format.format(time, "dd-MM-yyyy")}-access.log`;
}

const rfsStream = rfs.createStream(logFileName(new Date()), {
    interval: "1d",
    path: "./logs/"
})

app.use(morgan("combined", {
    stream: rfsStream
}));

app.get("/ping", (req, response, next) => {
    response.json({ "success": true })
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
