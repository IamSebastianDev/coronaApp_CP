/** @formatt */

// setup express
import express from "express"
const app = express(); 

app.use(express.json())

// import dotenv
import env from "./config/dotenv_config.mjs"; 

// setup express routes

import { storeGroup, decryptPersData } from "./api/handleData.mjs"

app.post("/api", storeGroup)
app.post("/decrypt", decryptPersData)

// public folder
app.use(express.static("./public")); 

// set up server
const PORT = process.env.PORT || 5000; 

app.listen(PORT, console.log(`App up on Port: ${PORT}`))