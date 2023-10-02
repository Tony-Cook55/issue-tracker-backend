
/*
ADD THIS IN THE .env file
DEBUG=app:*
PORT=5000
*/

// npm run start-dev


// ---- GCLOUD ----
// After we have gcloud to redeploy add this in terminal     gcloud app deploy
/*
To view your application in the web browser run:
  $ gcloud app browse
*/
// https://cook-issuetracker-backend.uc.r.appspot.com/




// I I I I I I I    IMPORTS   I I I I I I I

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

// I I I I I I I    IMPORTS   I I I I I I I


// THIS LOOKS FOR THE STATIC FILES
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);






// CREATES OUR WEB SEVER
const app = express();





// This looks for any static files in our public folder so our CSS and our HTML
app.use(express.static('public'))



// ````` UPDATE `````
//MIDDLEWARE THAT allows form data from a users input to UPDATE a USER by ID   .use is global
app.use(express.urlencoded({extended: true}));
// ````` UPDATE `````



// ****** This calls in our UserRouter Which is the code in the user.js file ******
app.use('/api/users',UserRouter);
// ****** This calls in our UserRouter Which is the code in the user.js file ******



// ****** This calls in our BugRouter Which is the code in the bug.js file ******
app.use('/api/bugs',BugRouter);
// ****** This calls in our BugRouter Which is the code in the bug.js file ******





// REGISTERS THE ROUTES FOR THE HOME PAGE index.html
app.get("/", (req, res) => {
  debugMain("Home Route Hit");
  res.sendFile("index.html");
});


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


