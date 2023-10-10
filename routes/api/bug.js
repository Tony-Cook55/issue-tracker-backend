

// I I I I I I I    IMPORTS   I I I I I I I
import express from "express";

const router = express.Router();


import debug from "debug";
const debugBug = debug("app:BugRouter");

// IMPORTS NANOID
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdef', 10)


// Imports all the  BUG CRUD functions from the database.js file                  assignBugToUser Also Uses getUserById
import { connect, getAllBugs, getBugById, addNewBug, updateBug, updateClassification, assignBugToUser, getUserById, closeBug,      deleteBug } from "../../database.js";

// Imports all the COMMENT functions from the database.js file to CRUD Users
import { newComment, getCommentById, getAllCommentsInBug,         deleteComment } from "../../database.js";

// Imports all the TEST CASE functions from the database.js file to CRUD Users
import { getAllTestCasesInBug, getTestCaseById, newTestCase, updateTestCase, deleteTestCase } from "../../database.js";






// CALLS IN THE MIDDLEWARE FUNCTION     - JOI
import Joi from "joi";

import { validId } from "../../middleware/validId.js";

import { validBody } from "../../middleware/validBody.js";


// I I I I I I I    IMPORTS   I I I I I I I



router.use(express.urlencoded({extended:false}));





// bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb BUGS bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb //

// ~~~~~~~~~~~~~~~~ FIND ALL BUGS ~~~~~~~~~~~~~~~~ //    http://localhost:5000/api/bugs/list
router.get("/list", async (req, res) => {
  try {

    // Calls in the getAllBugs() Function from database.js finding all the Bugs
    const allBugs = await getAllBugs();

    // Success Message
    res.status(200).json(allBugs);

    debugBug("Success! Found All Bugs\n"); // Message Appears in terminal
  }
  catch (err) { // Error Message
    res.status(500).json({Error: err.stack});
  }
});
// ~~~~~~~~~~~~~~~~ FIND ALL BUGS ~~~~~~~~~~~~~~~~ //





//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/bugs/ (id of User)
// What ever is in the .get("/:HERE!") you must make it the same as what in validId("HERE!")
router.get("/:bugId",     validId("bugId"),    async (req, res) => {

  try {

    // were are getting a request with the parameters a user puts for the .id
    const bugsId = req.bugId;

    // for every bugsId return true when our _id is == to the id user enters
    const receivedBugId = await getBugById(bugsId);

    if(receivedBugId){
      // Success Message
      res.status(200).json(receivedBugId);
      debugBug(`Success, Got "${receivedBugId.title}" Id: ${bugsId} \n`); // Message Appears in terminal
    }
    else{
      // Error Message
      res.status(404).json({Id_Error:`Bug ${bugsId} Not Found`});
      debugBug(`Bug ${bugsId} Not Found\n`); // Message Appears in terminal
    }

  }
  catch (err) {
    // Error Message
    res.status(500).json({Error: err.stack});
  }

});
//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!







// ++++++++++++++++ ADDING A NEW BUG TO THE DATABASE ++++++++++++++++++   http://localhost:5000/api/bugs/new


// Step 1 Define the ADD NEW BUG User Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const addNewBugSchema = Joi.object({

    title: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Title is required',
      'any.required': 'Title is required',
    }),


    description: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Description is required',
      'any.required': 'Description is required',
    }),


    stepsToReproduce: Joi.array()
    .items(
      Joi.string()
      .required()
      .min(1) // Minimum of at least one role
      .max(100) // Maximum of 100 steps
      .messages({
        'string.empty': 'Steps To Reproduce is required',
        'any.required': 'Steps To Reproduce is required',
        'array.base': 'Steps To Reproduce must be an array',
        'array.min': 'At least one step must be provided',
        'array.max': 'A maximum of 100 steps can be provided',
        'string.valid': 'Invalid Step To Reproduce provided',
      }),
    ),

});



router.post("/new",     validBody(addNewBugSchema),    async (req, res) => {

    // Getting the users data from the body like a form
    const newBug = req.body;


    // If there is not info in any of these fields throw error status. If not continue with adding Bug
    if(!newBug.title && !newBug.description && !newBug.stepsToReproduce){
      res.status(400).json({Error: "Please enter data for all fields"});
    }
    else if(!newBug.title){
      res.status(400).json({Title_Error: "Please enter data for the bugs Title"});
    }
    else if(!newBug.description){
      res.status(400).json({Description_Error: "Please enter data for the bugs Description"});
    }
    else if(!newBug.stepsToReproduce){
      res.status(400).json({Reproduction_Steps_Error: "Please enter data for the bugs Reproduction Steps"});
    }
    else{  // !!!!!! SUCCESS !!!!!!
      try { // IF we have valid data for a new user do this

          // ACTUALLY ADDS THE USERS INPUT HERE
            // Adds the users input from the body and plugs it into the addNewBug Function
            const addingNewBug = await addNewBug(newBug);
          // ACTUALLY ADDS THE USERS INPUT HERE


        // If user adding a New Bug is true it will be known as acknowledged
        if(addingNewBug.acknowledged == true){
          // Success Message
          res.status(200).json({Bug_Added: `Bug ${newBug.title} Added With An Id of ${addingNewBug.insertedId}`});
          debugBug(`Bug ${newBug.title}  Added With An Id of ${addingNewBug.insertedId} \n`); // Message Appears in terminal
        }
        else{
          // Error Message
          res.status(400).json({Error: `Bug ${newBug.title} Not Added`});
          debugBug(`Bug ${newBug.title} Not Added  \n`); // Message Appears in terminal
        }
      }
      catch (err) {
        res.status(500).json({Error: err.stack});
      }
    }
});
// ++++++++++++++++ ADDING A NEW BUG TO THE DATABASE ++++++++++++++++++








// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu  http://localhost:5000/api/bugs/ (ID here)

// Step 1 Define the UPDATE BUG Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const updateBugSchema = Joi.object({

  title: Joi.string()
  .trim()
  .messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required',
  }),


  description: Joi.string()
  .trim()
  .messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required',
  }),


  classification: Joi.string()
  .default("Unclassified") // If nothing is entered for this field it will auto default to being UnClassified
  .trim(),


  stepsToReproduce: Joi.array()
  .items(
    Joi.string()
    .min(1) // Minimum of at least one role
    .max(100) // Maximum of 100 steps
    .messages({
      'array.base': 'Steps To Reproduce must be an array',
      'array.min': 'At least one step must be provided',
      'array.max': 'A maximum of 100 steps can be provided',
      'string.valid': 'Invalid Step To Reproduce provided',
    }),
  ),


});




router.put("/:bugId",    validId("bugId"), validBody(updateBugSchema),   async (req, res) => {


    // This gets the ID from the users input
    const bugsId = req.bugId; //

    // For this line to work you have to have the body parser thats up top MIDDLEWARE
    const updatedBugFields = req.body;  // An .body is an object in updatedBug lets our body read the users id
    // .body holds all the information/fields the user enters


    try {

              // ------ CHANGES MADE ------ //    Ill be honest I tried to implement this my self but couldn't so this is ChatGBT
                // This is an empty array to store the changes the user makes
                const changesMadeByUserArray = [];

                // Retrieve the original user data from our database using same code from Get All Users
                const originalUsersData = await getAllBugs(bugsId);

                  // Compare the fields user enters to the original fields in getAllUsers()
                  for (const key in updatedBugFields) {
                    if (originalUsersData[key] !== updatedBugFields[key]) {
                      changesMadeByUserArray.push(key);
                    }
                  }
                // ------ CHANGES MADE ------ //



      // Calls the function and uses the users entered id and body params for the values to pass into function
      const bugUpdated = await updateBug(bugsId, updatedBugFields);

      // If the Bug is updated once it will gain a property called modifiedCount if this is 1 its true
      if(bugUpdated.modifiedCount == 1){
        // Success Message
        res.status(200).json({Bug_Updated: `Bug ${bugsId} updated`,
        //the length of the array of changes. IF array is 0? say message  'No changes made'
        Changes_Made_To: changesMadeByUserArray.length > 0 ? changesMadeByUserArray : 'No changes made'}); // Success Message}); // Success Message
        debugBug(`Bug ${bugsId} Updated`);
      }
      else{
        // Error Message
        res.status(404).json({Error: `Bug ${bugsId} Not Found`});
        debugBug(`Bug ${bugsId} Not Found  \n`); // Message Appears in terminal
      }
    }
    catch (err) {
      res.status(500).json({Error: err.stack});
    }

});
// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu






// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc  http://localhost:5000/api/bugs/classify/(ID here)/

// Step 1 Define the Login User Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const classifyBugSchema = Joi.object({

  classification: Joi.string()
  .trim()
  .required()
  .valid(
    "Approved", "approved",
    "Unapproved", "unapproved",
    "Duplicate", "duplicate",
  ) 
  .max(1) // There can only be 1 classification
  .message({
    'string.empty': 'A Classification is required',
    'any.required': 'A Classification is required',
    'any.only': 'Classifications Must Be Approved, Unapproved, or Duplicate', // None of the correct inputs are there
    'string.max': 'Only {#limit} Classification is allowed', // if more than 50 characters
  }),


});




router.put("/:bugId/classify",    validId("bugId"), validBody(classifyBugSchema),     async (req,res) => {

// OPTIONS TO CLASSIFY FOR: approved, unapproved, duplicate, by default unclassified


  //GETS the users input for the bugs id from the url
  const bugsId = req.bugId;

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const classifyBugFields = req.body  // An .body is an object lets our body read the Bugs id
  // .body holds all the information/fields the user enters

  // If there is no input for classification error
  if(!classifyBugFields.classification){
    res.status(400).json({Error: `Please Enter 1A Classification of: Approved, Unapproved, Duplicate, or Unclassified`});
  }
  // IF there is a response but it doesn't match Approved, Unapproved, Duplicate, or Unclassified throw error
  else if(
  classifyBugFields.classification.toLowerCase() !== "approved" &&
  classifyBugFields.classification.toLowerCase() !== "unapproved" &&
  classifyBugFields.classification.toLowerCase() !== "duplicate" &&
  classifyBugFields.classification.toLowerCase() !== "unclassified"
  ){
    res.status(400).json({Error: `Please Enter A Classification of: Approved, Unapproved, Duplicate, or Unclassified`});
  }
  else{  // ------ SUCCESS ------
      try {
        // Calls the function and uses the users entered id and body params for the values to pass into function
        const bugClassified = await updateClassification(bugsId, classifyBugFields);

        // If the Bugs Classification is updated once. It will gain a property called modifiedCount if this is 1 its true
        if(bugClassified.modifiedCount == 1){
          // Success Message
          res.status(200).json({Bug_Classified: `Bug ${bugsId} Classified With a Classification of ${classifyBugFields.classification}`}); // Success Message
          debugBug(`Bug ${bugsId} Classified With a Classification of ${classifyBugFields.classification}`);
        }
        else{
          // Error Message
          res.status(404).json({Error: `Bug ${bugsId} Not Found`});
          debugBug(`Bug ${bugsId} Not Found \n`); // Message Appears in terminal
        }
      }
      catch (err) {
        res.status(500).json({Error: err.stack});
      }
    }
});
// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc












// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa  Bugs can be assigned to Developers, Business Analysts, and Quality Analysts.

// Step 1 Define the ASSIGN BUG Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const assignBugSchema = Joi.object({

  assignedToUserId: Joi.string()
  .trim()
  .required(),
});




router.put("/:bugId/assign",   validId("bugId"), validBody(assignBugSchema),    async (req,res) => {

  //GETS the users input for the bugs id from the url
  const bugsId = req.bugId;

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const assignBugFields = req.body;  // An .body is an object in updatedBook lets our body read the Bugs id
  // .body holds all the information/fields the user enters



  // If there is no input in the body field for the Users input throw this error
  if(!assignBugFields){
    res.status(400).json({Error: `Bug ${bugsId} not found. Please Enter a User Id To assign Bug To The User`});
  }
  else if(!assignBugFields.assignedToUserId){
    res.status(400).json({Error: `Please Enter a User Id To assign Bug To The User`});
  }
  else{
      // THIS USES THE SAME CODE AS FIND USER BY ID
      // This line will see if the users input == a _id of a user in the database
      const userIdFound = await getUserById(assignBugFields.assignedToUserId);

      // If user properly enters the a valid ID of a USER!
      // IF TRUE GO AHEAD AND SET THE INPUTTED CORRECT USER ID TO THE BUG SPECIFIED IN THE URL
      if(userIdFound){
            // Success Message
            debugBug(`Success Got Users Id: ${userIdFound} Now Assigning Bug \n`); // Message Appears in terminal

            // ------ SUCCESS ------
          try {
            // Sets the bugsId and the users inputted fields into the assignBugToUser Function
            const bugAssigned = await assignBugToUser(bugsId, assignBugFields);

            // If the Bugs bugAssigned is updated once. It will gain a property called modifiedCount if this is 1 its true
            if(bugAssigned.modifiedCount == 1){
              // Success Message
              res.status(200).json({Bug_Assigned: `Bug ${bugsId} Assigned to User ${userIdFound.fullName}`, Users_Id: `${userIdFound.fullName}'s _id = ${userIdFound._id}`}); // Success Message
              debugBug(`Bug ${bugsId} Assigned to User ${userIdFound.fullName}`);
            }
            else{
              // Error Message
              res.status(404).json({Error: `Bug ${bugsId} Not Found`});
              debugBug(`Bug ${bugsId} Not Found \n`); // Message Appears in terminal
            }
          }
          catch (err) {
            res.status(500).json({Error: err.stack});
          }
    } // end of userIdFound Success If statement
    else{
      // IF THERE IS NO VALID USER ID FOUND BASED ON THE INPUT ERROR SHOWING THE ID THEY INPUTTED
      res.status(404).json({Error:`User ${assignBugFields.assignedToUserId} Not Found`});
      debugBug(`User ${assignBugFields.assignedToUserId} Not Found\n`); // Message Appears in terminal
    }
  }

});
// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa











// xxxxxxxxxxxxxx CLOSE BUG xxxxxxxxxxxxxx

// Step 1 Define the Close Bug Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const closeBugSchema = Joi.object({

  closed: Joi.string()
  .trim()
  .valid(  // User must enter True or false
    "True",
    "true",
    "False",
    "false",
  )
  .required(),
});




router.put("/:bugId/close",    validId("bugId"), validBody(closeBugSchema),     async (req,res) => {


  // This gets the ID from the users input
  const bugsId = req.bugId;

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const closedFields = req.body;  // An .body is an object in updatedBug lets our body read the users id
  // .body holds all the information/fields the user enters



  if(!closedFields.closed){
    res.status(400).json({Error: `Please Enter True or False to Properly Close a Bug`});
    debugBug(`Bug Not Closed`);
  }
  // IF The users response dose is not True or False Throw Error
  else if(
    closedFields.closed.toLowerCase() !== "true" &&
    closedFields.closed.toLowerCase() !== "false"
    ){
      res.status(400).json({Error: `Please Enter A Closed Statement of True or False`});
    }
  else{
  // IF user Enters Closed or closed go ahead and Update it
    try {

      // Calls the function and uses the users entered id and body params for the values to pass into function
      const bugIsClosed = await closeBug(bugsId, closedFields);

      // If the Bug is updated once it will gain a property called modifiedCount if this is 1 its true
      if(bugIsClosed.modifiedCount == 1 && closedFields.closed.toLowerCase() === "true"){
        // Success Message
        res.status(200).json({Bugs_Closed: `Bug ${bugsId} Is Closed`, ClosedStatus: `Closed = True`}); // Success Message
        debugBug(`Bug ${bugsId} Is Closed`);
      }

      else if(bugIsClosed.modifiedCount == 1 && closedFields.closed.toLowerCase() === "false"){
        // Success Message
        res.status(200).json({Bugs_Open: `Bug ${bugsId} Is Still Open`, ClosedStatus: `Closed = False`}); // Success Message
        debugBug(`Bug ${bugsId} Is Still Open`);
      }
      else{
        // Error Message
        res.status(404).json({Error: `Bug ${bugsId} Not Found`});
        debugBug(`Bug ${bugsId} Not Found  \n`); // Message Appears in terminal
      }
    }
    catch (err) {
      res.status(500).json({Error: err.stack});
    }
  }

});
// xxxxxxxxxxxxxx CLOSE BUG xxxxxxxxxxxxxx










// ********************* ONLY FOR MY USE NOT THE USER *********************
// -------------------- DELETING BUG FROM DATABASE -------------------
router.delete("/:bugId", async (req, res) => {

  // gets the id from the users url
  const bugsId = req.params.bugId;

  // CALLING THIS IN ALLOWS ME TO ACCESS THE BUGS NAME TO USE IN RESPONSES
  const allBugs = await getBugById(bugsId);


  try {
    // Uses the Users id and plugs it into the deleteUser function
      const deleteTheBug = await deleteBug(bugsId);

      if(deleteTheBug.deletedCount == 1){
        // Success Message
        res.status(200).json({Bugs_Deleted: `${allBugs.title} with an _id of ${bugsId} Deleted`, bugsId});
        debugBug(`${allBugs.title} with an _id of ${bugsId} Deleted`, bugsId); // Message Appears in terminal
      }
      else{
        // Error Message
        res.status(404).json({Error: `Bug ${bugsId} Not Found`});
        debugBug(`Bug ${bugsId} Not Found\n`); // Message Appears in terminal
      }
  }
  catch (err) {
    res.status(500).json({Error: err.stack});
  }

});
// -------------------- DELETING USER FROM DATABASE -------------------
// ********************* ONLY FOR MY USE NOT THE USER *********************




// bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb BUGS bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb //




































// ccccccccccccccccccccccccccccccccccccccccccccc COMMENTS ccccccccccccccccccccccccccccccccccccccccccccc //






// ~~~~~~~~~~~~~~~~ FIND ALL COMMENTS IN BUG ~~~~~~~~~~~~~~~~ //    http://localhost:5000/api/bugs/(Id of Bug)/comment/list
router.get("/:bugId/comment/list",    validId("bugId"),   async (req, res) => {
  try {

    const bugId = req.bugId;

    // Plugs in the users input for bugId then checks if its valid if so throw the comments
    const allCommentsInBug = await getAllCommentsInBug(bugId);


    // Success Message
    if (allCommentsInBug) {

      // This will get into our Bug that we provided then we look in the array called comments   so we do    allCommentsInBug.comments
      res.status(200).json(allCommentsInBug.comments);
      debugBug(`Success! Found All Comments in Bug ${bugId}\n`);
    } 
    else {
      res.status(404).json({ Id_Error: `Bug ${bugId} Not Found` });
    }
  }
  catch (err) { // Error Message
    res.status(500).json({Error: err.stack});
  }
});
// ~~~~~~~~~~~~~~~~ FIND ALL COMMENTS IN BUG ~~~~~~~~~~~~~~~~ //






//!!!!!!!!!!!!!!!!!!  SEARCHING FOR A COMMENT IN BUG BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/bugs/(id of Bug)/comment/(id of Comment)
// What ever is in the .get("/:HERE!") you must make it the same as what in validId("HERE!")
router.get("/:bugId/comment/:commentId",     validId("bugId"),    async (req, res) => {

  try {

    // were are getting a request with the parameters a user puts for the .id
    const bugsId = req.bugId;

    // Reads just the id of the comment entered
    const commentsId = req.params.commentId;



    // Plugs both our bug and comment id's into the function
    const receivedCommentsId = await getCommentById(bugsId, commentsId);


    if(receivedCommentsId){
      // Success Message
      res.status(200).json(receivedCommentsId); // Shows the comments
      debugBug(`Success, Got "${receivedCommentsId.author}" Comment Id: ${commentsId} \n`); // Message Appears in terminal
    }
    else{
      // Error Message
      res.status(404).json({Id_Error:`Bug or Comment Id Invalid`});
      debugBug(`Bug ${bugsId} or Comment ${commentsId} Not Found\n`); // Message Appears in terminal
    }

  }
  catch (err) {
    // Error Message
    res.status(500).json({Error: err.stack});
  }

});
//!!!!!!!!!!!!!!!!!!  SEARCHING FOR A COMMENT IN BUG BY ID !!!!!!!!!!!!!!!!









// ++++++++++++++++ ADDING A NEW COMMENT TO BUG ++++++++++++++++++

// Step 1 Define the ADD NEW COMMENT Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const addNewCommentSchema = Joi.object({

  author: Joi.string()
  .trim()
  .max(50)
  .required()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Author of Comment Is Required', // If password is left blank
    'string.max': 'Author must be at most {#limit} characters long', // if more than 50 characters
    'any.required': 'Author of Comment is Required', // if the password is left uncheck marked and not entered
  }),

  message: 
  Joi.string()
  .trim()
  .max(500)
  .required()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Please Enter a Message', // If Comment is left blank
    'string.max': 'Comment Can Only be 500 Characters Long', // if more than 500 characters
    'any.required': 'Please Enter a Message', // if the Comment is left uncheck marked and not entered
  }),

});



router.put("/:bugId/comment/new",    validId("bugId"), validBody(addNewCommentSchema),     async (req,res) => {

  
  
    //GETS the users input for the bugs id from the url
    const bugsId = req.bugId;
  
    // For this line to work you have to have the body parser thats up top MIDDLEWARE
    const newCommentFields = req.body  // An .body is an object lets our body read the Bugs id
    // .body holds all the information/fields the user enters
  


    if(!newCommentFields.author){
      res.status(400).json({Error: `Please Enter A Authors Name`});
    }
    else if(!newCommentFields.message){
      res.status(400).json({Error: `Please Enter A Message for Your Comment`});
    }

    else{  // ------ SUCCESS ------
        try {
          // Calls the function and uses the users entered id and body params for the values to pass into function
          const commentCreated = await newComment(bugsId, newCommentFields);
  
          // If the Bugs Classification is updated once. It will gain a property called modifiedCount if this is 1 its true
          if(commentCreated.modifiedCount == 1){
            // Success Message
            res.status(200).json({Comment_Created: `Comment Added to Bug ${bugsId} by ${newCommentFields.author}`}); // Success Message
            debugBug(`Comment Added to Bug ${bugsId} by ${newCommentFields.author}`);
          }
          else{
            // Error Message
            res.status(404).json({Error: `Bug ${bugsId} Not Found`});
            debugBug(`Bug ${bugsId} Not Found \n`); // Message Appears in terminal
          }
        }
        catch (err) {
          res.status(500).json({Error: err.stack});
        }
      }
  });

// ++++++++++++++++ ADDING A NEW COMMENT TO BUG ++++++++++++++++++









// ********************* ONLY FOR MY USE NOT THE USER *********************
// -------------------- DELETING COMMENT FROM A BUG -------------------

router.delete("/:bugId/comment/:commentId",     validId("bugId"),    async (req, res) => {

  try {

  // were are getting a request with the parameters a user puts for the .id
  const bugsId = req.bugId;

  // Reads just the id of the comment entered
  const commentsId = req.params.commentId;


  // Uses the Bug and Comments Id and plugs it into the deleteComment function
    const commentIsDeleted = await deleteComment(bugsId, commentsId);

    // If the comment is deleted then success
    if(commentIsDeleted){
      // Success Message
      res.status(200).json({Comment_Deleted: `Comment Deleted`});
      debugBug(`Comment Deleted`); // Message Appears in terminal
    }
    else{
      // Error Message
      res.status(404).json({Error: `Bug Id ${bugsId} Not Found`});
      debugBug(`Bug ${bugsId} Not Found\n`); // Message Appears in terminal
    }
  }
  catch (err) {
    res.status(500).json({Error: err.stack});
  }


});
// -------------------- DELETING COMMENT FROM A BUG -------------------
// ********************* ONLY FOR MY USE NOT THE USER *********************






// ccccccccccccccccccccccccccccccccccccccccccccc COMMENTS ccccccccccccccccccccccccccccccccccccccccccccc //


































// tc tc tc tc tc tc tc tc tc tc tc  tc tc tc TEST CASES tc tc tc tc tc tc  tc tc tc tc tc tc tc //





// ~~~~~~~~~~~~~~~~ FIND ALL TEST CASES IN BUG ~~~~~~~~~~~~~~~~ //    http://localhost:5000/api/bugs/65241671c43c2e5dd553db87/test/list
router.get("/:bugId/test/list",    validId("bugId"),   async (req, res) => {
  try {

    const bugId = req.bugId;

    // Plugs in the users input for bugId then checks if its valid if so throw the testCases
    const allTestCasesInBug = await getAllTestCasesInBug(bugId);


    // Success Message
    if (allTestCasesInBug) {

      // This will get into our Bug that we provided then we look in the array called testCases   so we do    allTestCasesInBug.comments
      res.status(200).json(allTestCasesInBug.testCases);
      debugBug(`Success! Found All Test Cases in Bug ${bugId}\n`);
    } 
    else {
      res.status(404).json({ Id_Error: `Bug ${bugId} Not Found` });
    }
  }
  catch (err) { // Error Message
    res.status(500).json({Error: err.stack});
  }
});
// ~~~~~~~~~~~~~~~~ FIND ALL TEST CASES IN BUG ~~~~~~~~~~~~~~~~ //








//!!!!!!!!!!!!!!!!!!  SEARCHING FOR A TEST CASES IN BUG BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/bugs/65241671c43c2e5dd553db87/test/65257171f013f1eed470fbf1
// What ever is in the .get("/:HERE!") you must make it the same as what in validId("HERE!")
router.get("/:bugId/test/:testId",     validId("bugId"),    async (req, res) => {

  try {

    // were are getting a request with the parameters a user puts for the .id
    const bugsId = req.bugId;

    // Reads just the id of the testCase entered
    const testCasesID = req.params.testId;



    // Plugs both our bug and Test Case id's into the function
    const receivedTestCasesId = await getTestCaseById(bugsId, testCasesID);


    if(receivedTestCasesId){
      // Success Message
      res.status(200).json(receivedTestCasesId); // Shows the Test Cases
      debugBug(`Success, Got "${receivedTestCasesId.title}" Test Case Id: ${testCasesID} \n`); // Message Appears in terminal
    }
    else{
      // Error Message
      res.status(404).json({Id_Error:`Bug or Comment Id Invalid`});
      debugBug(`Bug Id ${bugsId} or Test Case Id ${testCasesID} Not Found\n`); // Message Appears in terminal
    }

  }
  catch (err) {
    // Error Message
    res.status(500).json({Error: err.stack});
  }

});
//!!!!!!!!!!!!!!!!!!  SEARCHING FOR A TEST CASES IN BUG BY ID !!!!!!!!!!!!!!!!








// ++++++++++++++++ ADDING A NEW COMMENT TO BUG ++++++++++++++++++    //http://localhost:5000/api/bugs/65241671c43c2e5dd553db87/test/new

// Step 1 Define the ADD NEW COMMENT Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA


// This makes the user have to follow a strict input when entering the appliedFixOnDate
 const appliedFixOnDateFormat = /^(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])-\d{4}$/; // MM-DD-YYYY format regex

const addNewTestCaseSchema = Joi.object({

  title: Joi.string()
  .trim()
  .required()
  .max(50)
  .messages({
    'string.empty': 'Title is required',
    'string.max': 'Test Case Title Can Only be 50 Characters Long', // if more than 50 characters
    'any.required': 'Title is required',
  }),

  userId: 
  Joi.string()
  .trim()
  .required()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Please Enter a Valid User Id', // If Comment is left blank
    'any.required': 'Please Enter a Valid User Id', // if the Comment is left uncheck marked and not entered
  }),

  passed: Joi.string()
  .trim()
  .valid(
    "True",
    "true",
    "False",
    "false"
  )
  .required()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Must Be True or False', // If passed is left blank
    'any.required': 'Must Be True or False', // if the passed is left uncheck marked and not entered
  }),

  versionRelease: 
  Joi.string()
  .trim()
  .max(20)
  .required()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Please Enter a Version Release', // If versionRelease is left blank
    'string.max': 'Version Release Can Only be 20 Characters Long', // if more than 20 characters
    'any.required': 'Please Enter a Version Release', // if the versionRelease is left uncheck marked and not entered     
  }),


  // OPTIONAL DUE TO IT EITHER BEING FAILED AND NOT FIXED
  appliedFixOnDate: 
  Joi.string()
  .regex(appliedFixOnDateFormat)  // Calls in the strict Date format a user must follow   (MM-DD-YYYY)
  .trim()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Please Enter a Valid Fix On Date (MM-DD-YYYY)', // If appliedFixOnDate is left blank
    'string.pattern.base': 'Please Enter a Valid Fix On Date (MM-DD-YYYY)',
    'any.required': 'Please Enter a Valid Fix On Date',
  }),




});



router.put("/:bugId/test/new",    validId("bugId"), validBody(addNewTestCaseSchema),     async (req,res) => {   

  
  
    //GETS the users input for the bugs id from the url
    const bugsId = req.bugId;
  
    // For this line to work you have to have the body parser thats up top MIDDLEWARE
    const newTestCaseFields = req.body  // An .body is an object lets our body read the Bugs id
    // .body holds all the information/fields the user enters
  

      // THIS USES THE SAME CODE AS FIND USER BY ID
      // This line will see if the users input == a _id of a user in the database
      const userIdFound = await getUserById(newTestCaseFields.userId);


      // If user properly enters a valid ID of a USER!
      // CHECK TO SEE IF THEIR ROLE HAS QUALITY ANALYST
      if(userIdFound.role.includes("Quality Analyst")){
            // Success Message
            debugBug(`User with ID ${userIdFound._id} is a Quality Analyst.\n`); // Message Appears in terminal

          try {
            // Calls the function and uses the users entered id and body params for the values to pass into function
            const testCaseCreated = await newTestCase(bugsId, newTestCaseFields);
    
            // If the Bug is updated once. It will gain a property called modifiedCount if this is 1 its true
            if(testCaseCreated.modifiedCount === 1){
              // Success Message
              res.status(200).json({TestCase_Created: `Test Case Has Been Added to Bug ${bugsId} by ${userIdFound.fullName}`}); // Success Message
              debugBug(`Test Case Has Been Added to Bug ${bugsId} by ${userIdFound.fullName}`);
            }
            else{
              // Error Message
              res.status(404).json({Error: `Bug ${bugsId} Not Found`});
              debugBug(`Bug ${bugsId} Not Found \n`); // Message Appears in terminal
            }
          }
          catch (err) {
            res.status(500).json({Error: err.stack});
          }
      }
      else{               // Error Message
        res.status(404).json({Error: `User ${newTestCaseFields.userId} Is Not a Quality Analyst`});
        debugBug(`User ${newTestCaseFields.userId} Is Not a Quality Analyst`); // Message Appears in terminal
      }

  });

// ++++++++++++++++ ADDING A NEW COMMENT TO BUG ++++++++++++++++++







// uuuuuuuuuuuuuuuuu UPDATE A TEST CASE uuuuuuuuuuuuuuuuu  http://localhost:5000/api/bugs/65241671c43c2e5dd553db87/test/65257171f013f1eed470fbf1



// Step 1 Define the UPDATE TEST CASE Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const updateTestCasesSchema = Joi.object({

  title: Joi.string()
  .trim()
  .max(50)
  .messages({
    'string.empty': 'Title is required',
    'string.max': 'Test Case Title Can Only be 50 Characters Long', // if more than 50 characters
  }),


  userId: 
  Joi.string()
  .trim()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Please Enter a Valid User Id', // If userId is left blank
  }),


  passed: Joi.string()
  .trim()
  .valid(
    "True",
    "true",
    "False",
    "false"
  )
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Must Be True or False', // If passed is left blank
  }),


  versionRelease: 
  Joi.string()
  .trim()
  .max(20)
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Please Enter a Version Release', // If versionRelease is left blank
    'string.max': 'Version Release Can Only be 20 Characters Long', // if more than 20 characters
    'any.required': 'Please Enter a Version Release', // if the versionRelease is left uncheck marked and not entered     
  }),


  appliedFixOnDate: 
  Joi.string()
  .regex(appliedFixOnDateFormat)  // Calls in the strict Date format a user must follow  MOOCHES OFF OF ADDING FUNCTION  (MM-DD-YYYY)
  .trim()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Please Enter a Valid Fix On Date (MM-DD-YYYY)', // If appliedFixOnDate is left blank
    'string.pattern.base': 'Please Enter a Valid Fix On Date (MM-DD-YYYY)',
    'any.required': 'Please Enter a Valid Fix On Date',
  }),

});




router.put("/:bugId/test/:testId",    validId("bugId"), validBody(updateTestCasesSchema),   async (req, res) => {


    // This gets the ID from the users input
    const bugsId = req.bugId; //


    const testCasesId= req.params.testId




    // For this line to work you have to have the body parser thats up top MIDDLEWARE
    const updatedTestCaseFields = req.body;  // An .body is an object in updatedBug lets our body read the users id
    // .body holds all the information/fields the user enters


    try {


      // Calls the function and uses the users entered id and body params for the values to pass into function
      const testCaseUpdated = await updateTestCase(bugsId, testCasesId, updatedTestCaseFields);

      // If the Bug is updated once it will gain a property called modifiedCount if this is 1 its true
      if(testCaseUpdated.modifiedCount == 1){
        // Success Message
        res.status(200).json({Bug_Updated: `Test Case ${testCasesId} updated`,     });
        //the length of the array of changes. IF array is 0? say message  'No changes made'
        //Changes_Made_To: changesMadeByUserArray.length > 0 ? changesMadeByUserArray : 'No changes made'}); // Success Message
        debugBug(`Test Case ${testCasesId} Updated`);
      }
      else{
        // Error Message
        res.status(404).json({Id_Error: `Bug Id ${bugsId} or Test Case Id ${testCasesId} Not Found`});
        debugBug(`Bug Id ${bugsId} or Test Case Id ${testCasesId} Not Found \n`); // Message Appears in terminal
      }
    }
    catch (err) {
      res.status(500).json({Error: err.stack});
    }

});
// uuuuuuuuuuuuuuuuu UPDATE A TEST CASE uuuuuuuuuuuuuuuuu






// -------------------- DELETING TEST CASE FROM A BUG -------------------   http://localhost:5000/api/bugs/65241671c43c2e5dd553db87/test/652567d8be0078c8eacf6685

router.delete("/:bugId/test/:testId",     validId("bugId"),    async (req, res) => {

  try {

  // were are getting a request with the parameters a user puts for the .id
  const bugsId = req.bugId;

  // Reads just the id of the comment entered
  const testCasesId = req.params.testId;


  // Uses the Bug and Comments Id and plugs it into the deleteComment function
    const testCaseIsDeleted = await deleteTestCase(bugsId, testCasesId);

    // If the comment is deleted then success
    if(testCaseIsDeleted){
      // Success Message
      res.status(200).json({TestCase_Deleted: `Test Case ${testCasesId} Has Been Deleted`});
      debugBug(`Test Case ${testCasesId} Has Been Deleted`); // Message Appears in terminal
    }
    else{
      // Error Message
      res.status(404).json({Error: `Bug Id ${bugsId} Not Found`});
      debugBug(`Bug ${bugsId} Not Found\n`); // Message Appears in terminal
    }
  }
  catch (err) {
    res.status(500).json({Error: err.stack});
  }


});
// -------------------- DELETING TEST CASE FROM A BUG -------------------




// tc tc tc tc tc tc tc tc tc tc tc  tc tc tc TEST CASES tc tc tc tc tc tc  tc tc tc tc tc tc tc //






















export {router as BugRouter};






