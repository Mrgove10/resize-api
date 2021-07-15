const express = require('express')
const app = express()
const port = 3000
const sharp = require('sharp')
const axios = require('axios')
const config = require('./config.js')

// test urls :
// http://localhost:3000/high/94466236.jpg
// http://localhost:3000/low/94466236.jpg?w=100
app.get('/:definition/:img', async (req, res) => {
    const imgName = req.params.img;
    const def = req.params.definition;
    let widthParam = 100;
    if (req.query.w !== undefined && req.query.w !== null) {
        widthParam = parseInt(req.query.w);
    }
    //console.log(imgName, def, widthParam);

    if (imgName && def) {
        const originalURL = config.rootUrl + imgName;
        if (def === "high") {
            // if in high def redirect to the original url
            res.redirect(originalURL);
        }
        else if (def === "low") {
            // if the resolution is low, compress its
            if (widthParam < 100) {
                // 100 width, lowest reslution
                widthParam = 100
            }
            axios.get(originalURL, {
                responseType: 'arraybuffer'
            }).then((response) => {
                const imgBuffer = Buffer.from(response.data, 'binary')
                // console.log(imgBuffer);
                sharp(imgBuffer)
                    .resize({ width: widthParam })
                    .toBuffer()
                    .then(data => {
                        var img = Buffer.from(data, 'base64');
                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Content-Length': img.length
                        });
                        res.end(img);
                    })
                    .catch((err) => console.log(err));
            });
        }
    }
})

app.listen(port, () => {
    console.log(`Resize api listening at http://localhost:${port}`)
})

