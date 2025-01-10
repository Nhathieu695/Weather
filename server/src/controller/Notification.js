

const admin = require("firebase-admin");

const serviceAccount = require('../serviceAccountKey.json');
const { timeStamp } = require("console");

const db = admin.firestore();

const FCMNofitication = {
    notification: async (req, res) => {

        const docRef = db.collection('FCM_tokens');
        const snapshot = await docRef.get();
        if (snapshot.empty) {
            console.log('No matching documents.');
            return;
        }

        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
        });

        // // See documentation on defining a message payload.
        // const message = {
        //     notification: {
        //         title: sdfsdfsdfsd,
        //         body: fghfghfgh
        //     },
        //     condition: condition
        // };

        // // Send a message to devices subscribed to the combination of topics
        // // specified by the provided condition.
        // getMessaging().send(message)
        //     .then((response) => {
        //         // Response is a message ID string.
        //         console.log('Successfully sent message:', response);
        //     })
        //     .catch((error) => {
        //         console.log('Error sending message:', error);
        //     });
    }
}
module.exports = FCMNofitication;