require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GeneratingGroceryList = async (number, budget, diet, cuisine) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a detailed grocery list for a meal plan that can feed ${number} for biweekly. The total budget is $${budget}, and the list should follow a ${diet} diet. Please focus on ${cuisine} cuisine. Include items in categories like proteins, vegetables, fruits, grains, and spices. Ensure that each item fits within the dietary preferences and is affordable within the budget. Provide the grocery list in an array format with each item as an object containing the name, quantity needed, estimated cost, and category (e.g., protein, grain). Your response should only have an array and no text, Example to follow for each object in the array: category
    "Protein",
    estimatedCost
    "10.00",
    name
    "Chicken Breast",
    quantity
    "1.5 lbs" `;

    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        responseText = responseText.replace(/```json|```/g, '').trim();

        const jsonArrayMatch = responseText.match(/\[.*\]/s);
        if (jsonArrayMatch) {
            const groceryList = JSON.parse(jsonArrayMatch[0]);
            return groceryList 
        } else {
            console.error("Error: Could not find JSON array in response.");
            GeneratingGroceryList(number, budget, diet, cuisine);
        }

    } catch (error) {
        console.error("Error generating grocery list:", error);
    }
};

const GenerateRecipeList = async (groceryList) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Based on the following grocery items, create a two-week meal plan with only recipe names that can be made from this list: ${JSON.stringify(groceryList)}. Provide the recipe names in an array format with no additional text.`;

    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        responseText = responseText.replace(/```json|```/g, '').trim();

        const jsonArrayMatch = responseText.match(/\[.*\]/s);
        if (jsonArrayMatch) {
            const recipeList = JSON.parse(jsonArrayMatch[0]);
            return recipeList;
        } else {
            console.error("Error: Could not find JSON array in response.");
            return null;
        }
    } catch (error) {
        console.error("Error generating recipe list:", error);
        return null;
    }
};



module.exports = { GeneratingGroceryList, GenerateRecipeList };
