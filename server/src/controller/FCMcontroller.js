

const admin = require("firebase-admin");

const serviceAccount = require('../serviceAccountKey.json');
const { timeStamp } = require("console");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();


const FCMController = {
    saveToken: async (req, res) => {
        try {
            const { token, lat, lng } = req.body
            console.log("token", token, "lat", lat, "lng", lng)
            if (!token || !lat || !lng) {
                return res.status(400).json({ message: "Invalid request body. Token, lat, and lng are required." });
            }
            const docRef = db.collection('FCM_tokens').doc(token)
            const docSnapshot = await docRef.get()

            if (docSnapshot.exists) {
                await docRef.update({
                    lat: lat,
                    lng: lng,
                    timeStamp: admin.firestore.FieldValue.serverTimestamp()
                })
                res.status(200).json({ message: "Token updated with new location" })
            }
            else {
                await docRef.set({
                    token: token,
                    lat: lat,
                    lng: lng,
                    timeStamp: admin.firestore.FieldValue.serverTimestamp()
                })
                res.status(200).json({ message: "New Token saved" })
            }
        } catch (error) {
            console.error("Error saving token:", error);
            res.status(500).json({ message: "Internal server error." });
        }

    }
}



module.exports = FCMController;