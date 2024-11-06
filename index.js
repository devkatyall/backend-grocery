const express = require("express");
const db = require('./config/Firebase')
const { GeneratingGroceryList } = require('./services/Gemini')
const ReqGrocery = require('./routes/generatingGrocery')

require('dotenv').config()

const app = express();

app.use(express.json());

app.post('/generategrocery', ReqGrocery)

app.listen(3000, () => console.log('Server is up'))


module.exports = app