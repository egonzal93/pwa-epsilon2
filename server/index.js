
const http = require('http');
const push = require('./push');

// Create HTTP server
http.createServer ( (req, res) => {

    // Enable CORS to all '*'
    res.setHeader('Access-Control-Allow-Origin', '*');

    // res.end('Hello from HTTP server');

    // Get request vars
    const { headers, url, method } = req;

    // Subscribe
    if ( method === 'POST' && url.match(/^\/subscribe\/?/)) {

        // Get POST body
        let body = [];

        // Read response stream
        req
            .on('data', chunk => body.push(chunk))
            .on('end', () => {

                res.on('error', (err) => {
                    console.error(err);
                });

                // Parse subscription body to object
                let subscription = JSON.parse(body.toString());

                // console.log(subscription);
                push.addSubscription( subscription);

                res.writeHead(200, {'Content-Type': 'application/json'});

                const responseBody = { headers, method, url, body };

                res.end(JSON.stringify(responseBody));
            });

    // Public key
    } else if ( url.match(/^\/key\/?/)) {

        // Get VAPID key from push module
        // Respond with a public key
        res.end(push.getKey());

    // Push notification
    } else if ( method === 'POST' && url.match(/^\/push\/?/)) {

        // Get POST Body
        let body = [];

        // Read body stream
        req
            .on('data', chunk => body.push(chunk))
            .on('end', () => {
                let data = body.toString();

                // Send notification with POST body
                push.send( data);

                // Respond
                res.end(`Push sent ${data}\n`)

            })

    // Not found
    } else {
        res.status = 404;
        res.end('Error: Unknown request');
    }
})
.listen(3333, () => {
    console.log('Server running..')
});