
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



// ccc COOKIES ccc //
// This imports the cookie parser that allows us to write code to allow to check cookies to make sessions
import cookieParser from "cookie-parser";

// This is the tokens that is assigned to a user when successfully logged in


// THIS IS GLOBAL MIDDLEWARE THAT ALLOWS US TO USE req.auth to make sure users cant access site if not logged in
import { authMiddleware } from "@merlin4/express-auth";
// ccc COOKIES ccc //



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




// mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm MIDDLEWARE mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm // 

// This looks for any static files in our public folder so our CSS and our HTML
app.use(express.static('public'))



// ````` UPDATE `````
//MIDDLEWARE THAT allows form data from a users input to UPDATE a USER by ID   .use is global
app.use(express.urlencoded({extended: true}));
// ````` UPDATE `````



// ccc 🍪 COOKIES 🍪 ccc //
// Allows us to actually create cookies
app.use(cookieParser());


// Reads from our cookie and if the user is authenticated it will put the users info inside the cookie
// This is a middleware that will VALIDATE AND CHECK/look inside our created cookie and generate a req.auth and place the token in their
app.use(authMiddleware(process.env.AUTH_SECRET, 'authToken',
    {
    httpOnly: true,
    maxAge: 1000*60*60
    }
));
// ccc 🍪 COOKIES 🍪 ccc //




// ****** This calls in our UserRouter Which is the code in the user.js file ******
app.use('/api/users',UserRouter);
// ****** This calls in our UserRouter Which is the code in the user.js file ******



// ****** This calls in our BugRouter Which is the code in the bug.js file ******
app.use('/api/bugs',BugRouter);
// ****** This calls in our BugRouter Which is the code in the bug.js file ******

// mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm MIDDLEWARE mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm // 






// REGISTERS THE ROUTES FOR THE HOME PAGE index.html
app.get("/", (req, res) => {
  debugMain("Home Route Hit");
  res.sendFile("index.html");
});




// --------------------- ERROR HANDLING ---------------------
// ERROR HANDLERS
app.use((req, res) => {
  debugMain(`Sorry Couldn't find ${req.originalUrl}`);
  res.status(404).json({Error:`Sorry Couldn't Fine ${req.originalUrl}`});
});

// Handles Sever Exceptions to keep my server from crashing
app.use((err, req, res, next) => {
  //debugServer(err.stack);
  res.status(err.status).json({Sever_Error: err.message});
});
// --------------------- ERROR HANDLING ---------------------



//ADD LISTENER FOR REQUESTS
const port = process.env.PORT || 5001;

app.listen(port, () =>{
  debugMain(`Listening on Port http://localhost:${port}`)
});


