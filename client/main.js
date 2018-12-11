
let swReg;

// Push server URL
const serverUrl = 'http://localhost:3333';

// Update UI for subscribe status
const setSubscribedStatus = (state) => {
    if (state) {
        document.getElementById('subscribe').className = 'hidden';
        document.getElementById('unsubscribe').className = '';
    } else {  document.getElementById('subscribe').className = '';
        document.getElementById('unsubscribe').className = 'hidden';
    }
}

// Register Service Worker
navigator.serviceWorker.register('sw.js')
    .then( reg => {

        // Reference registration globally
        swReg = reg;

        // Check if a subscription exists, and if so, update UI
        swReg.pushManager.getSubscription()
            .then( setSubscribedStatus );
    })
    // Log errors
    .catch(console.error);

// Test the node.js HTTP server
// fetch('http://localhost:3333/subscribe', { method: 'POST'})
//     .then( res => res.text())
//     .then(console.log);

// Get public key from server
const getApplicationServerKey = () => {
    // Fetch the public key from the push server
    return fetch(`${serverUrl}/key`)
        // .then(res => res.text())
        // Parse response body as arrayBuffer
        .then( res => res.arrayBuffer())
        // Return the buffer as Uint8Array
        .then( key => new Uint8Array(key))
        .catch(console.error);
}


// Unsubscribe from push service
const unsubscribe = () => {

    // Unsubscribe & update UI
    swReg.pushManager.getSubscription()
        .then(subsciption => {
            subsciption.unsubscribe()
                .then( () => {
                    setSubscribedStatus(false);
                } )
        });
}

// Subscription for push notifications
const subscribe = async () => {

    // Check registration is available
    if (!swReg) return console.error('Service Worker Registration Not Found');

    try {
        const applicationServerKey = await getApplicationServerKey();
        const res = await swReg.pushManager.subscribe({ userVisibleOnly: true , applicationServerKey});
        const sub = res.toJSON();
        console.log(`Subscribed ${JSON.stringify(sub)}`);
        try {
            const subscription = await fetch(`${serverUrl}/subscribe`, { method: 'POST', body: JSON.stringify(sub)});
            setSubscribedStatus(subscription);
        }catch (err) {
            unsubscribe();
            console.log(err);
        }
    } catch (err) {
        console.log(err);
    }
        // .then( applicationServerKey => {
        //     // Subscribe
        //     swReg.pushManager.subscribe({ userVisibleOnly: true , applicationServerKey})
        //         .then( res => res.toJSON())
        //         .then( subscription => {
        //
        //             // console.log(subscription);
        //             console.log(`Subscribed ${JSON.stringify(subscription)}`);
        //             // Pass the subscription to server
        //             fetch(`${serverUrl}/subscribe`, { method: 'POST', body: JSON.stringify(subscription)})
        //                 .then( subscription => setSubscribedStatus(subscription))
        //                 .catch(err => {
        //                     unsubscribe();
        //                     console.log(err);
        //                 })
        //
        //         })
        //         .catch(console.error);
        // });
};