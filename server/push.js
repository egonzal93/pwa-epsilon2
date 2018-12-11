// Modules
const webpush = require('web-push');
const urlsafeBase64 = require('urlsafe-base64');
const Storage = require('node-storage');

// Vapid keys
const vapid = require('./vapid.json');

// Configure web-push
webpush.setVapidDetails(
    'mailto:jasongonzales@outlook.com',
    vapid.publicKey,
    vapid.privateKey
);

// Subscriptions (File operations are all relative to the node_process running the script
// not the file itself
// const store = new Storage('./subscriptions-db');
const store = new Storage(`${__dirname}/db`);

// let subscriptions = [] ;
let subscriptions = store.get('subscriptions') || [];

// Create URL safe vapid base 64 stream public key, // decode string into buffer
// return value is a buffer
module.exports.getKey = () => urlsafeBase64.decode(vapid.publicKey);

// Store new subscription
module.exports.addSubscription = (subscription) => {

    // Add to subscription array
    subscriptions.push(subscription);

    // console.log(subscriptions);

    // Persist subscriptions
    store.put('subscriptions', subscriptions);
}

// Send notifications to all registered subscriptions
module.exports.send = (message) => {

    // Notification promises
    let notifications = [];

    // Loop subscriptions
    subscriptions.forEach(( subscription, i) => {

        // Send Notification
        let p = webpush.sendNotification(subscription, message)
            .catch( status => {
                // Check for "410- Gone" status and mark for deletion
                if (status.statusCode === 410) subscriptions[i]['delete'] = true;

                // Return any value
                return null;
            });

        // Push notification promise to array
        notifications.push(p)
    })

    // Clean subscriptions marked for deletion
    Promise.all( notifications).then( () => {

        // Filter subscriptions that were marked for deletion
        subscriptions = subscriptions.filter(subscriptions => !subscriptions.delete);

        // Persist 'cleaned' subscription
        store.put('subscriptions', subscription);

    })
}
