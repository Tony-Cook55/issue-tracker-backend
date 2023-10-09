

// I I I I I I I    IMPORTS   I I I I I I I
import express from "express";

const router = express.Router();


import debug from "debug";
const debugComment = debug("app:CommentRouter");






// CALLS IN THE MIDDLEWARE FUNCTION     - JOI
import Joi from "joi";

import { validId } from "../../middleware/validId.js";

import { validBody } from "../../middleware/validBody.js";


// I I I I I I I    IMPORTS   I I I I I I I



router.use(express.urlencoded({extended:false}));
















export {router as CommentRouter};
