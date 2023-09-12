
// ++++++++++++++ IMPORTS ++++++++++++++++

/* eslint-disable no-undef */
import * as dotenv from "dotenv";
dotenv.config();

import debug from "debug";
const debugMain = debug("app:Server");

import path from "path";

import { fileURLToPath } from "url";

import express from "express";

import { nanoid } from 'nanoid'



// THIS IMPORTS OUR user.js FILE
import { UserRouter } from './routes/api/user.js';

// THIS IMPORTS OUR bug.js FILE
import { BugRouter } from './routes/api/bug.js';

// ++++++++++++++ IMPORTS ++++++++++++++++

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// CREATES OUR WEB SEVER
const app = express();



// ````` UPDATE `````
//MIDDLEWARE THAT allows form data from a users input to UPDATE a USER by ID   .use is global
app.use(express.urlencoded({extended: true}));
// ````` UPDATE `````





// REGISTERS THE ROUTES
app.get("/", (req, res) => {
  debugMain("Home Route Hit");
  res.sendFile(path.join(__dirname, "public/index.html"));
});


// ****** This calls in our UserRouter Which is the code in the user.js file ******
app.use('/api/users',UserRouter);
// ****** This calls in our UserRouter Which is the code in the user.js file ******



// ERROR HANDLERS
app.use((req, res) => {
  debugMain(`Sorry Couldn't find ${req.originalUrl}`);
  res.status(404).json({error:`Sorry Couldn't Fine ${req.originalUrl}`});
});


//ADD LISTENER FOR REQUESTS
const port = process.env.PORT || 5001;

app.listen(port, () =>{
  debugMain(`Listening on Port http://localhost:${port}`)
});


