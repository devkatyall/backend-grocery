const db = require('../config/Firebase')
const { GeneratingGroceryList, GenerateRecipeList } = require('../services/Gemini')
const admin = require("firebase-admin")

async function ReqGrocery(req, res){

    const { userId, idToken} = req.body;

    if(!userId || !idToken){
        return res.status(403).json({error: 'Unauthorised Request. Please make sure you are including token and userId.'})
    }

    try {
        // const decodedToken = await admin.auth().verifyIdToken(idToken);
        // if (decodedToken.uid !== userId) {
        //     return res.status(403).json({ error: 'Unauthorized request' });
        // }

        // Proceed with the rest of the operation as authenticated
        const userDocRef = db.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const { numberOfPeople, budget, preference, cuisine } = userData;

        // Generate grocery list
        const groceryList = await GeneratingGroceryList(numberOfPeople, budget, preference, cuisine);

        if (groceryList) {
            // Store grocery list back in Firebase (optional)
            const response = await userDocRef.collection('groceryLists').add({ 
                list: groceryList, 
                generatedAt: new Date() 
            });
            const recipes = await GenerateRecipeList(groceryList)
            if(recipes){
                await userDocRef.collection('groceryLists').doc(response.id).update({
                    lastUpdate: new Date(),
                    recipes
                });
                res.status(200).json({ groceryList, recipes });
            }
            else{
                res.status(200).json({ groceryList})
            }
        } else {
            res.status(500).json({ error: 'Failed to generate grocery list.' });
        }

    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({ error: 'Invalid ID token' });
    }
}

module.exports = ReqGrocery