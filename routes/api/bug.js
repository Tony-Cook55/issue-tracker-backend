//   To Run Program: npm run dev   

// I I I I I I I    IMPORTS   I I I I I I I
import express from "express";

const router = express.Router();


import debug from "debug";
const debugBug = debug("app:BugRouter");

// IMPORTS NANOID
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdef', 10)




// ccccc 🍪 COOKIES & AUTH TOKEN 🍪 ccccc //
// Allows us to make new tokens to authorize users when they log in
import  jwt from "jsonwebtoken";

// This is a method that allows a user to NEED TO BE LOGGED IN it will throw the merlin MESSAGE: You are not logged in!
import { isLoggedIn } from "@merlin4/express-auth";


// Imports the use of creating a new user id
import { newId } from "../../database.js";

// ccccc 🍪COOKIES & AUTH TOKEN 🍪 ccccc //



// aaaaaaaaaaaaaaaa AUTHORIZE USERS aaaaaaaaaaaaaaaa//

//This calls in a function from merlin that will send an error if a users Role does not match the permissions we gave that role in the Collection
import { hasPermission } from "@merlin4/express-auth";

// aaaaaaaaaaaaaaaa AUTHORIZE USERS aaaaaaaaaaaaaaaa//



// Imports all the  BUG CRUD functions from the database.js file                  assignBugToUser Also Uses getUserById
import { connect, getAllBugs, getBugById, addNewBug, updateBug, updateClassification, assignBugToUser, getUserById, closeBug,      deleteBug } from "../../database.js";



// Imports all the COMMENT functions from the database.js file to CRUD Users
import { newComment, getCommentById, getAllCommentsInBug,         deleteComment } from "../../database.js";



// Imports all the TEST CASE functions from the database.js file to CRUD Users
import { getAllTestCasesInBug, getTestCaseById, newTestCase, updateTestCase, deleteTestCase } from "../../database.js";


// This is what makes a new collection named Edits and allows users updates to be seen
import { saveEdit } from "../../database.js";




// CALLS IN THE MIDDLEWARE FUNCTION     - JOI
import Joi from "joi";

import { validId } from "../../middleware/validId.js";

import { validBody } from "../../middleware/validBody.js";


// I I I I I I I    IMPORTS   I I I I I I I



router.use(express.urlencoded({extended:false}));

























// bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb BUGS bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb //

// ~~~~~~~~~~~~~~~~ FIND ALL BUGS ~~~~~~~~~~~~~~~~ //    http://localhost:5000/api/bugs/list
router.get("/list",   isLoggedIn(), hasPermission("canViewData"),  async (req, res) => {
  try {

    // ~~~~ OLD WAY TO JUST SEARCH FOR ALL ~~~~
    // // Calls in the getAllBugs() Function from database.js finding all the Bugs
    // const allBugs = await getAllBugs();
    // // Success Message
    //res.status(200).json(allBugs);



    //   ALL KEYS IN ONE LINE   //
    // Get the Key's from the params query in postman    //pageSize is how many pages you want, pageNumber is the specific page you want
    //let {keywords, classification, maxAge, minAge, closed, sortBy, pageSize, pageNumber} = req.query;


    // This stage of the aggregation pipeline is the FILTER it will match what the users input is compared to whats in DB
    const match = {};




  /* key key key key   KEYWORDS  key key key key */

      // Get the Key from the params query in postman called keywords
      let {keywords} = req.query;

      // If there are keywords that match do the following
      if(keywords){
        // If the keywords entered match
        match.$text = {$search: keywords};
      }

  /* key key key key   KEYWORDS  key key key key */





  /* ccccccccccccccccc CLASSIFICATION ccccccccccccccccc */

      // Get the Key from the params query in postman called role
      let {classification} = req.query;

      // If there is a Role entered then do this
      if(classification){
        // The entered Role ! MUST BE EXACT ! to how it is in the roles array
        match.classification = {$eq: classification};
      }
  
  /* ccccccccccccccccc CLASSIFICATION ccccccccccccccccc */





  /* age age age age  AGE OF BUG   age age age age */

      // Get the Key from the params query in postman called maxAge and minAge
      let {maxAge, minAge} = req.query;

      maxAge = parseInt(maxAge);
      minAge = parseInt(minAge);


      const today = new Date(); // Get the current date and time
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0); // Remove time from Date
      

      const pastMaximumDaysOld = new Date(today);
      pastMaximumDaysOld.setDate(pastMaximumDaysOld.getDate() - maxAge); // Set pastMaximumDaysOld to today minus maxAge
      
      const pastMinimumDaysOld = new Date(today);
      pastMinimumDaysOld.setDate(pastMinimumDaysOld.getDate() - minAge); // Set pastMinimumDaysOld to today minus minAge
      
      
      // Does the corresponding result for maxAge and minAge
      if (maxAge && minAge) {
        // This match here is going inside of my array named bugAdded then getting the createdOn date
        match['bugCreationInformation.createdOn'] = {
          $lte: pastMinimumDaysOld,
          $gte: pastMaximumDaysOld
        };
      } else if (minAge) {
        match['bugCreationInformation.createdOn'] = { $lte: pastMinimumDaysOld };
      } else if (maxAge) {
        match['bugCreationInformation.createdOn'] = { $gte: pastMaximumDaysOld };
      }



      if(maxAge || minAge){
        debugBug(`The Date Searching For is ${JSON.stringify(pastMaximumDaysOld, pastMinimumDaysOld)}`);
      }



  /* age age age age  AGE OF BUG   age age age age */





  /* ??????????????????? IS BUG CLOSED ??????????????????? */

      // Get the Key from the params query in postman called closed
      let {closed} = req.query;

      // If the user enters Either True or False then it will show corresponding Bugs
      if(closed){
        // If the user enters either "True" or "False" (regardless of case), it will show corresponding bugs
        closed = closed.toLowerCase() === "true" ? "True" : "False"; // If you get rid of auto capitalize get rid of this as well
        match.closed = {$eq: closed};
      }
  
  /* ??????????????????? IS BUG CLOSED ??????????????????? */






  /* sssssssssssssssssss SORTING sssssssssssssssssss */

      // By Default we will sort The dates by newest Bugs added from the bugCreationInformation Array in DB
      let sort = {"bugCreationInformation.createdOn": -1};  // The 1 is ascending  ~  -1 is descending order

      // Gets the users input in the sortBy field
      let {sortBy} = req.query;

      // If the words below are in sortBy it will make sort == and OVERWRITE that item instead of the default or the last one 
      switch(sortBy){

        // If the user adds title in the sortBy it will then make title ascending, created date descending
        case "title": sort = {title : 1, createdOn: -1}; break;

        // If classification is entered then it will make classification ascending, created date descending
        case "classification": sort = {classification : 1, classifiedOn : 1, "bugCreationInformation.createdOn": -1}; break;

        // If assignedTo is entered then it will make assigned to name ascending, created date descending
        case "assignedTo": sort = {"assignedTo.assignedToUser": 1, "assignedTo.assignedOn": -1}; break;

        // If createdBy is entered then it will make  created by name, created date descending
        // Searching in the array named bugCreationInformation then getting the values .bugAddedByUserFullName & .createdOn
        case "createdBy": sort = { "bugCreationInformation.bugCreatedByUser": 1, "bugCreationInformation.createdOn": -1}; break;

        // If newest is entered then the users created date will be descending
        case "newest": sort = { "bugCreationInformation.createdOn": -1}; break;

        // If oldest is entered then the users created date will be ascending
        case "oldest": sort = { "bugCreationInformation.createdOn": 1}; break;
      }

  /* sssssssssssssssssss SORTING sssssssssssssssssss */






  /* ppppppppppppppppppppp PAGE SEARCHES ppppppppppppppppppppp */

    let {pageSize, pageNumber} = req.query;

      // Makes users input into an int or just default to 10 pages shown
      pageSize = parseInt(pageSize) || 10;
      // Make the users input into an int or just go to page 1 by default
      pageNumber = parseInt(pageNumber) || 1;


      // When the user goes on another page such as page 2 it the DB needs to not show things on the first page
      const skip = (pageNumber - 1) * pageSize;
      // This is the amount of pages shown at a time
      const limit = pageSize;

  /* ppppppppppppppppppppp PAGE SEARCHES ppppppppppppppppppppp */







  /* [][][][][][][][][][][][] PIPELINE [][][][][][][][][][][][] */
    // This is going to match whats in the param query
    const pipeline = [
      // This matches the users input with whats in DB
      {$match: match},


      // Calls in the sort from the top which by default has the bugsCreationDate ascending
      {$sort: sort}, 


      // This is the page Number outputs that skips the amount of pages and the limit of pages shown
      {$skip: skip},
      {$limit: limit},
    ];
  /* [][][][][][][][][][][][] PIPELINE [][][][][][][][][][][][] */





  // =============== OUTPUT =============== //

      // Connects to our database to allow us to still search
      const db = await connect();

      // This looks though the DB pipeline and aggregates it to either all the results or the search
      const cursor = await db.collection('Bug').aggregate(pipeline);

      // Sets the cursor's results into an array to be displayed
      const foundBug = await cursor.toArray();

      // Success Message -  Shows the results in an array 
      res.status(200).json(foundBug);

  // =============== OUTPUT =============== //



    debugBug("Success! Found All Bugs"); // Message Appears in terminal
    debugBug(`The Query string is ${JSON.stringify(req.query)}`); // Shows the query.params being used
  }
  catch (err) { // Error Message
    res.status(500).json({Error: err.stack});
  }
});
// ~~~~~~~~~~~~~~~~ FIND ALL BUGS ~~~~~~~~~~~~~~~~ //







//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/bugs/ (id of User)
// What ever is in the .get("/:HERE!") you must make it the same as what in validId("HERE!")
router.get("/:bugId",   isLoggedIn(),   hasPermission("canViewData"),   validId("bugId"),    async (req, res) => {

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
    .max(40) // Set the maximum character limit
    .regex(/^(?![A-Z]+$)/) // Ensure not all uppercase
    .messages({
      'string.empty': 'Title is required',
      'any.required': 'Title is required',
      'string.pattern.base': 'Title cannot be all uppercase',
    }),


    description: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Description is required',
      'any.required': 'Description is required',
    }),


    // Allows the user to enter either 1 item or an array of items in postman
    stepsToReproduce: Joi.alternatives().try(
      Joi.array().items(Joi.string().min(1).max(100)).min(1).max(100),
      Joi.string().required().min(1).max(100)
    ).messages({
      'array.base': 'Steps To Reproduce must be an array or a single step',
      'array.min': 'At least one step must be provided in the array',
      'array.max': 'A maximum of 100 steps can be provided in the array',
      'string.min': 'Step must have at least 1 character',
      'string.max': 'Step can have a maximum of 100 characters',
      'string.empty': 'Step is required',
    }),
    


    /*
    bugAddedByUser: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'User Adding Bug is required',
      'any.required': 'User Adding Bug is required',
    }),
    */

});



router.post("/new",   isLoggedIn(), hasPermission("canCreateBug"),  validBody(addNewBugSchema),    async (req, res) => {

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
      try { 


        /* This code below was before the cookies. It allowed someone to enter a User Id and then if that id
            was found it would use their name and say they created that bug. 


        // // THIS USES THE SAME CODE AS FIND USER BY ID
        // // This line will see if the users input in bugAddedByUser == a _id of a user in the database
        //const userIdFound = await getUserById(newBug.bugAddedByUser);

        // // If a user enters a CORRECT USER ID IN bugAddedByUser then go ahead and add the bug
        // if(userIdFound){

          // // THIS GETS THE USERS FULL NAME AND ADDS IT INTO OUR BUG
          //newBug.bugAddedByUserFullName = userIdFound.fullName;
          
          */


          // If the user is logged in then we will get THAT LOGGED IN USERS INFORMATION
          const getLoggedInUser = await getUserById(newId(req.auth._id))  // req.auth._id   gets the current cookie logged in user



          // ACTUALLY ADDS THE USERS INPUT HERE

            // Adds the users input from the body and the logged in users INFO and plugs it into the addNewBug Function
            const addingNewBug = await addNewBug(newBug, getLoggedInUser); // getLoggedInUser == users info thats then extracted for name, email, role, in database

            // ACTUALLY ADDS THE USERS INPUT HERE



          // If user adding a New Bug is true it will be known as acknowledged
          if(addingNewBug.acknowledged == true){



          // eeeeeeeeee EDITS MADE eeeeeeeeee //
              // When the user successfully makes an account in the New Edits collection will show that this was done
              const editsMade = {
                timeStamp: new Date(),
                bugAddedOn: new Date().toLocaleString('en-US'),
                collection: "Bug",
                operation: "New Bug Added", 
                bugAdded: addingNewBug.insertedId, // Shows bugs id thats made
                bugAddedByUser: getLoggedInUser.fullName, // shows the cookie info for the logged in user
                auth: req.auth // Cookie information
              }

              // This is the function that pushes the editsMade array into the new Collection named Edits
              let updatesMade = await saveEdit(editsMade);
          // eeeeeeeeee EDITS MADE eeeeeeeeee //



            // Success Message                                                                                                                 old call in to see users Id then get name                
            res.status(200).json({Bug_Added: `Bug ${newBug.title} Added With An Id of ${addingNewBug.insertedId} by User ${ getLoggedInUser.fullName  /*userIdFound.fullName*/} With a User Id of ${getLoggedInUser._id}`});
            debugBug(`Bug ${newBug.title} Added With An Id of ${addingNewBug.insertedId} by User ${ getLoggedInUser.fullName} With a User Id of: ${getLoggedInUser._id}`); // Message Appears in terminal
          }
          else{
            // Error Message
            res.status(400).json({Error: `Bug ${newBug.title} Not Added`});
            debugBug(`Bug ${newBug.title} Not Added  \n`);
          }


        // } // This else statement is if the user enters a bad User id for bugAddedByUser
        // else{
        //   res.status(400).json({Error: `Users Id Trying To Add Bug Is Invalid`});
        //   debugBug(`Users Id Trying To Add Bug Is Invalid`); // Message Appears in terminal
        // }
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
  .max(40) // Set the maximum character limit
  .regex(/^(?![A-Z]+$)/) // Ensure not all uppercase
  .messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required',
    'string.pattern.base': 'Title cannot be all uppercase',
  }),


  description: Joi.string()
  .trim()
  .messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required',
  }),



  stepsToReproduce: Joi.alternatives().try(
    Joi.array().items(Joi.string().min(1).max(100)).min(1).max(100),
    Joi.string().min(1).max(100)
  ).messages({
    'array.base': 'Steps To Reproduce must be an array or a single step',
    'array.min': 'At least one step must be provided in the array',
    'array.max': 'A maximum of 100 steps can be provided in the array',
    'string.min': 'Step must have at least 1 character',
    'string.max': 'Step can have a maximum of 100 characters',
    'string.empty': 'Step is required',
  }),



});




router.put("/:bugId",   isLoggedIn(),  hasPermission("canEditAnyBug", "canEditIfAssignedTo", "canEditMyBug"),   validId("bugId"), validBody(updateBugSchema),   async (req, res) => {


    // This gets the ID from the users input
    const bugsId = req.bugId; //

    // For this line to work you have to have the body parser thats up top MIDDLEWARE
    const updatedBugFields = req.body;  // An .body is an object in updatedBug lets our body read the users id
    // .body holds all the information/fields the user enters


    // If the user is logged in then we will get THAT LOGGED IN USERS INFORMATION
    const getLoggedInUser = await getUserById(newId(req.auth._id))  // req.auth._id   gets the current cookie logged in user


    
    // Retrieve the original user data from our database using same code from Get Bug by Id
    const originalBugsData = await getBugById(bugsId);



    // This is looking at the logged in users id and if it matches the id of who created the bug in the bugCreationInformation object they can update
    if (getLoggedInUser._id.toString() === originalBugsData.bugCreationInformation[0]._id.toString() 
        || getLoggedInUser.role.includes("Business Analyst") ) // If the user logged in is a Business Analyst they have permission
    {

      try {
                  // ------ CHANGES MADE ------ //
                      // This is an empty array to store the changes the user makes
                      const changesMadeByUser = [];

                      // Retrieve the original user data from our database using same code from Get Bug by Id
                      //const originalBugsData = await getBugById(bugsId);

                        // Compare the fields user enters to the original fields in getAllUsers()
                        for (const key in updatedBugFields) {
                          if (originalBugsData[key] !== updatedBugFields[key]) {
                            const change = {
                              field: key,
                              oldValue: originalBugsData[key],
                              newValue: updatedBugFields[key]
                            };
                            changesMadeByUser.push(change);
                          }
                        }


                      // This is the message i will call down to display both the field changed and the value that was inputted
                      const changesMadeByUserMessage = changesMadeByUser.length > 0
                      ? changesMadeByUser.map(change => ` Field ${change.field} was '${change.oldValue}' ~ User ${getLoggedInUser.fullName} Changed ${change.field} to '${change.newValue}' `)
                      : 'No changes made';
                  // ------ CHANGES MADE ------ //



        // Calls the function and uses the users entered id and body params for the values to pass into function
        // we send in the getLoggedInUser information so we can send the users _id into the database
        const bugUpdated = await updateBug(bugsId, updatedBugFields, getLoggedInUser); 



        // If the Bug is updated once it will gain a property called modifiedCount if this is 1 its true
        if(bugUpdated.modifiedCount == 1){



              // eeeeeeeeee EDITS MADE eeeeeeeeee //
                // When the user successfully makes an account in the New Edits collection will show that this was done
                const editsMade = {
                  timeStamp: new Date(),
                  bugUpdatedOn: new Date().toLocaleString('en-US'),
                  collection: "Bug",
                  operation: "Bug Updated", 
                  bugUpdated: bugsId, // Shows bugs id thats updated
                  bugUpdatedByUser: getLoggedInUser.fullName, // shows the cookie info for the logged in user
                  fieldsUpdated: changesMadeByUserMessage, // Shows the message of what changed
                  auth: req.auth // Cookie information
                }

                // This is the function that pushes the editsMade array into the new Collection named Edits
                let updatesMade = await saveEdit(editsMade);
            // eeeeeeeeee EDITS MADE eeeeeeeeee //



          // Success Message
          res.status(200).json({Bug_Updated: `Bug ${bugsId} updated by User ${getLoggedInUser.fullName} with a User Id of ${getLoggedInUser._id}`,
          Changes_Made_To: changesMadeByUserMessage }); // Success Message

          debugBug(`Bug ${bugsId} updated by User ${getLoggedInUser.fullName} with a User Id of ${getLoggedInUser._id}`);
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
    else { // Error if user is not the creator of Bug or a Business Analyst
      res.status(404).json({
        Update_Error: `User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id} Can't Update This Bug`
        ,
        Users_Allowed: `Only the Creator of the Bug '${originalBugsData.bugCreationInformation[0].bugCreatedByUser}' with an Id of ${originalBugsData.bugCreationInformation[0]._id} or a Business Analyst can Update Bugs`
      });
      
      debugBug(`User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id} Can't Update This Bug`, `Only the Creator of the Bug '${originalBugsData.bugCreationInformation[0].bugCreatedByUser}' with an Id of ${originalBugsData.bugCreationInformation[0]._id} or a Business Analyst can Update Bugs`);
      debugBug("Logged User ID:", getLoggedInUser._id.toString());
      debugBug("Bug Creator ID:", originalBugsData.bugCreationInformation[0]._id.toString());
    }

});
// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu








// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc  http://localhost:5000/api/bugs/classify/(ID here)/

// Step 1 Define the Login User Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const classifyBugSchema = Joi.object({

  classification: Joi.string()
  .trim()
  .required()
  // This will allow for only these words to be added
  // .valid(
  //   "Approved", "approved",
  //   "Unapproved", "unapproved",
  //   "Duplicate", "duplicate",
  // ) 
  
  // Will turn the users input into a capital letter to allow us to search using capitalize later
  .custom((value, helpers) => { // THIS HERE IS WHAT CAPITALIZES USERS INPUT
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    if (["Approved", "Unapproved", "Duplicate"].includes(capitalizedValue)) {
      return capitalizedValue;
    } else {
      return helpers.message('Classifications Must Be Approved, Unapproved, or Duplicate');
    }
  })
  .message({
    'string.empty': 'A Classification is required',
    'any.required': 'A Classification is required',
    'any.only': 'Classifications Must Be Approved, Unapproved, or Duplicate', // None of the correct inputs are there
  }),

});




router.put("/:bugId/classify",    isLoggedIn(),  hasPermission("canClassifyAnyBug", "canEditIfAssignedTo", "canEditMyBug"),  validId("bugId"), validBody(classifyBugSchema),     async (req,res) => {

// OPTIONS TO CLASSIFY FOR: approved, unapproved, duplicate, by default unclassified


  //GETS the users input for the bugs id from the url
  const bugsId = req.bugId;

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const classifyBugFields = req.body  // An .body is an object lets our body read the Bugs id
  // .body holds all the information/fields the user enters

  // If there is no input for classification error
  if(!classifyBugFields.classification){
    res.status(400).json({Error: `Please Enter A Classification of: Approved, Unapproved, Duplicate, or Unclassified`});
  }
  // IF there is a response but it doesn't match Approved, Unapproved, Duplicate, or Unclassified throw error
  else if( // Makes all responses lowercase to match with our lowercase fields
  classifyBugFields.classification.toLowerCase() !== "approved" &&
  classifyBugFields.classification.toLowerCase() !== "unapproved" &&
  classifyBugFields.classification.toLowerCase() !== "duplicate" &&
  classifyBugFields.classification.toLowerCase() !== "unclassified"
  ){
    res.status(400).json({Error: `Please Enter A Classification of: Approved, Unapproved, Duplicate, or Unclassified`});
  }
  else{  // ------ SUCCESS ------


    // If the user is logged in then we will get THAT LOGGED IN USERS INFORMATION
    const getLoggedInUser = await getUserById(newId(req.auth._id))  // req.auth._id   gets the current cookie logged in user

    // Retrieve the original user data from our database using same code from Get Bug by Id
    const originalBugsData = await getBugById(bugsId);


    // This is looking at the logged in users id and if it matches the id of who created the bug in the bugCreationInformation object they can update
    if (getLoggedInUser._id.toString() === originalBugsData.bugCreationInformation[0]._id.toString() 
        || getLoggedInUser.role.includes("Business Analyst") ) // If the user logged in is a Business Analyst they have permission
    {


        try {

                  // ------ CHANGES MADE ------ //
                      // This is an empty array to store the changes the user makes
                      const changesMadeByUser = [];

                      // // Retrieve the original user data from our database using same code from Get Bug by Id
                      // const originalBugsData = await getBugById(bugsId);

                        // Compare the fields user enters to the original fields in getAllUsers()
                        for (const key in classifyBugFields) {
                          if (originalBugsData[key] !== classifyBugFields[key]) {
                            const change = {
                              field: key,
                              oldValue: originalBugsData[key],
                              newValue: classifyBugFields[key]
                            };
                            changesMadeByUser.push(change);
                          }
                        }


                      // This is the message i will call down to display both the field changed and the value that was inputted
                      const changesMadeByUserMessage = changesMadeByUser.length > 0
                      ? changesMadeByUser.map(change => ` Field ${change.field} was '${change.oldValue}' ~ User ${getLoggedInUser.fullName} Changed ${change.field} to '${change.newValue}' `)
                      : 'No changes made';
                  // ------ CHANGES MADE ------ //





          // Calls the function and uses the users entered id and body params for the values to pass into function
                // we send in the getLoggedInUser information so we can send the users _id into the database
          const bugClassified = await updateClassification(bugsId, classifyBugFields, getLoggedInUser);



          // If the Bugs Classification is updated once. It will gain a property called modifiedCount if this is 1 its true
          if(bugClassified.modifiedCount == 1){


              // eeeeeeeeee EDITS MADE eeeeeeeeee //
                // When the user successfully makes an account in the New Edits collection will show that this was done
                const editsMade = {
                  timeStamp: new Date(),
                  bugClassifiedOn: new Date().toLocaleString('en-US'),
                  collection: "Bug",
                  operation: "Bug Classified", 
                  bugClassified: bugsId, // Shows bugs id thats classified
                  bugClassifiedByUser: getLoggedInUser.fullName, // shows the cookie info for the logged in user
                  fieldsUpdated: changesMadeByUserMessage, // Shows the message of what changed
                  auth: req.auth // Cookie information
                }

                // This is the function that pushes the editsMade array into the new Collection named Edits
                let updatesMade = await saveEdit(editsMade);
              // eeeeeeeeee EDITS MADE eeeeeeeeee //


            // Success Messages
            res.status(200).json({Bug_Classified: `Bug ${bugsId} Classified With a Classification of '${classifyBugFields.classification}' by User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id}`,
              Changes_Made_To: changesMadeByUserMessage});
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

    }// Error if user is not the creator of Bug or a Business Analyst
    else {
      res.status(404).json({
        Assign_Error: `User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id} Can't Classify This Bug`
        ,
        Users_Allowed: `Only the Creator of the Bug '${originalBugsData.bugCreationInformation[0].bugCreatedByUser}' with an Id of ${originalBugsData.bugCreationInformation[0]._id} or a Business Analyst can Classify Bugs`
      });

      debugBug(`User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id} Can't Classify This Bug`, `Only the Creator of the Bug '${originalBugsData.bugCreationInformation[0].bugCreatedByUser}' with an Id of ${originalBugsData.bugCreationInformation[0]._id} or a Business Analyst can Classify Bugs`);
      debugBug("Logged User ID:", getLoggedInUser._id.toString());
      debugBug("Bug Creator ID:", originalBugsData.bugCreationInformation[0]._id.toString());
    }

  }// End of main else statement
});
// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc












// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa  Bugs can be assigned to Developers, Business Analysts, and Quality Analysts.

// Step 1 Define the ASSIGN BUG Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const assignBugSchema = Joi.object({

  assignedToUserId: Joi.string()
  .trim()
  .required(),

});




router.put("/:bugId/assign",  hasPermission("canReassignAnyBug", "canReassignIfAssignedTo", "canEditMyBug"),  isLoggedIn(),   validId("bugId"), validBody(assignBugSchema),    async (req,res) => {

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



      // If the user is logged in then we will get THAT LOGGED IN USERS INFORMATION
      const getLoggedInUser = await getUserById(newId(req.auth._id));  // req.auth._id   gets the current cookie logged in user

      const originalBugsData = await getBugById(bugsId);


    // This is looking at the logged in users id and if it matches the id of who created the bug in the bugCreationInformation object they can update
    if (getLoggedInUser._id.toString() === originalBugsData.bugCreationInformation[0]._id.toString() 
    || getLoggedInUser.role.includes("Business Analyst") || getLoggedInUser.role.includes("Technical Manager") ) // If the user logged in is a Business Analyst or a Technical Manager they have permission
    {

                // ------ CHANGES MADE ------ //
                    // This is an empty array to store the changes the user makes
                    const changesMadeByUser = [];

                    // Retrieve the original user data from our database using same code from Get Bug by Id
                    //const originalBugsData = await getBugById(bugsId);

                      // Compare the fields user enters to the original fields in getAllUsers()
                      for (const key in assignBugFields) {
                        if (originalBugsData[key] !== assignBugFields[key]) {
                          const change = {
                            field: key,
                            oldValue: originalBugsData[key],
                            newValue: assignBugFields[key]
                          };
                          changesMadeByUser.push(change);
                        }
                      }


                    // This is the message i will call down to display both the field changed and the value that was inputted
                    const changesMadeByUserMessage = changesMadeByUser.length > 0
                    ? changesMadeByUser.map(change => ` Field ${change.field} was '${change.oldValue}' ~ User ${getLoggedInUser.fullName} Changed ${change.field} to '${change.newValue}' `)
                    : 'No changes made';
                // ------ CHANGES MADE ------ //


        // If user properly enters the a valid ID of a USER!
        // IF TRUE GO AHEAD AND SET THE INPUTTED CORRECT USER ID TO THE BUG SPECIFIED IN THE URL
        if(userIdFound){
              // ------ SUCCESS ------
            try {



              // Sets the bugsId and the users inputted fields into the assignBugToUser Function
              const bugAssigned = await assignBugToUser(bugsId, assignBugFields, getLoggedInUser);



              // If the Bugs bugAssigned is updated once. It will gain a property called modifiedCount if this is 1 its true
              if(bugAssigned.modifiedCount == 1){


                    // eeeeeeeeee EDITS MADE eeeeeeeeee //
                      // When the user successfully makes an account in the New Edits collection will show that this was done
                      const editsMade = {
                        timeStamp: new Date(),
                        bugAssignedOn: new Date().toLocaleString('en-US'),
                        collection: "Bug",
                        operation: "Bug Assigned", 
                        bugAssigned: bugsId, // Shows bugs id thats classified
                        bugAssignedByUser: getLoggedInUser.fullName, // shows the cookie info for the logged in user
                        fieldsUpdated: changesMadeByUserMessage, // Shows the message of what changed
                        auth: req.auth // Cookie information
                      }

                      // This is the function that pushes the editsMade array into the new Collection named Edits
                      let updatesMade = await saveEdit(editsMade);
                    // eeeeeeeeee EDITS MADE eeeeeeeeee //


                // Success Message
                res.status(200).json({Bug_Assigned: `Bug ${bugsId} Assigned to User ${userIdFound.fullName} By User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id}` , User_Assigned_Id: `${userIdFound.fullName}'s _id = ${userIdFound._id}`,
                  Changes_Made_To: changesMadeByUserMessage}); // Success Message
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
        res.status(404).json({Id_Error: `User Id ${assignBugFields.assignedToUserId} Not Found`});
        debugBug(`User Id ${assignBugFields.assignedToUserId} Not Found`);
      }

    }// Error if user is not the creator of Bug or a Business Analyst
    else {
      res.status(404).json({
        Assign_Error: `User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id} Can't Assign This Bug`
        ,
        Users_Allowed: `Only the Creator of the Bug '${originalBugsData.bugCreationInformation[0].bugCreatedByUser}' with an Id of ${originalBugsData.bugCreationInformation[0]._id}, a Business Analyst, or a Technical Manager can Assign Bugs`
      });

      debugBug(`User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id} Can't Assign This Bug`, `Only the Creator of the Bug '${originalBugsData.bugCreationInformation[0].bugCreatedByUser}' with an Id of ${originalBugsData.bugCreationInformation[0]._id}, a Business Analyst, or a Technical Manager can Assign Bugs`);
      debugBug("Logged User ID:", getLoggedInUser._id.toString());
      debugBug("Bug Creator ID:", originalBugsData.bugCreationInformation[0]._id.toString());
    }



  } // end of main else statement


});
// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa











// xxxxxxxxxxxxxx CLOSE BUG xxxxxxxxxxxxxx

// Step 1 Define the Close Bug Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const closeBugSchema = Joi.object({

  closed: Joi.string()
  .trim()
  // .valid(  // User must enter True or false
  //   "True",
  //   "true",
  //   "False",
  //   "false",
  // )
    // Witchcraft that will turn the users input into a capital letter to allow us to search using capitalize later
    .custom((value, helpers) => {
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      if (["True", "False"].includes(capitalizedValue)) {
        return capitalizedValue;
      } else {
        return helpers.message('Please Enter True or False');
      }
    })
  .required(),
});




router.put("/:bugId/close",  isLoggedIn(),  hasPermission("canCloseAnyBug"),  validId("bugId"), validBody(closeBugSchema),     async (req,res) => {


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

      // If the user is logged in then we will get THAT LOGGED IN USERS INFORMATION
      const getLoggedInUser = await getUserById(newId(req.auth._id))  // req.auth._id   gets the current cookie logged in user



      // Calls the function and uses the users entered id and body params for the values to pass into function
      const bugIsClosed = await closeBug(bugsId, closedFields, getLoggedInUser);



      // IF USER ENTERS - //!TRUE
      if(bugIsClosed.modifiedCount == 1 && closedFields.closed.toLowerCase() === "true"){


            // eeeeeeeeee EDITS MADE eeeeeeeeee //
              // When the user successfully makes an account in the New Edits collection will show that this was done
              const editsMade = {
                timeStamp: new Date(),
                bugClosedOn: new Date().toLocaleString('en-US'),
                collection: "Bug",
                operation: "Bug Closed",
                closedStatus: true,
                bugAssigned: bugsId, // Shows bugs id thats classified
                bugAssignedByUser: getLoggedInUser.fullName, // shows the cookie info for the logged in user
                //fieldsUpdated: changesMadeByUserMessage, // Shows the message of what changed
                auth: req.auth // Cookie information
              }

              // This is the function that pushes the editsMade array into the new Collection named Edits
              let updatesMade = await saveEdit(editsMade);
            // eeeeeeeeee EDITS MADE eeeeeeeeee //


        // Success Message
        res.status(200).json({Bugs_Closed: `Bug ${bugsId} Is Closed`, ClosedStatus: `Closed = True`}); // Success Message
        debugBug(`Bug ${bugsId} Is Closed. Closed = True`);
      }


      // IF USER ENTERS - //!FALSE
      else if(bugIsClosed.modifiedCount == 1 && closedFields.closed.toLowerCase() === "false"){


            // eeeeeeeeee EDITS MADE eeeeeeeeee //
              // When the user successfully makes an account in the New Edits collection will show that this was done
              const editsMade = {
                timeStamp: new Date(),
                bugClosedOn: new Date().toLocaleString('en-US'),
                collection: "Bug",
                operation: "Bug Closed",
                closedStatus: false,
                bugAssigned: bugsId, // Shows bugs id thats classified
                bugAssignedByUser: getLoggedInUser.fullName, // shows the cookie info for the logged in user
                //fieldsUpdated: changesMadeByUserMessage, // Shows the message of what changed
                auth: req.auth // Cookie information
              }

              // This is the function that pushes the editsMade array into the new Collection named Edits
              let updatesMade = await saveEdit(editsMade);
            // eeeeeeeeee EDITS MADE eeeeeeeeee //

        // Success Message
        res.status(200).json({Bugs_Open: `Bug ${bugsId} Is Still Open`, ClosedStatus: `Closed = False`}); // Success Message
        debugBug(`Bug ${bugsId} Is Still Open. Closed = False`);
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
router.delete("/:bugId",   isLoggedIn(),   async (req, res) => {

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
router.get("/:bugId/comment/list",    isLoggedIn(),  hasPermission("canViewData"),  validId("bugId"),   async (req, res) => {
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
    // If there is not even a comment array in the bug say this
    else if(allCommentsInBug !== allCommentsInBug.comments){
      res.status(404).json({ Comment_Error: `No Comments Found in Bug ${bugId}` });
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
router.get("/:bugId/comment/:commentId",  isLoggedIn(),  hasPermission("canViewData"),  validId("bugId"),    async (req, res) => {

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

  /*
  author: Joi.string()
  .trim()
  .max(50)
  .required()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Author of Comment Is Required', // If password is left blank
    'string.max': 'Author must be at most {#limit} characters long', // if more than 50 characters
    'any.required': 'Author of Comment is Required', // if the password is left uncheck marked and not entered
  }),
  */

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



router.put("/:bugId/comment/new",   isLoggedIn(),  hasPermission("canAddComments"),   validId("bugId"), validBody(addNewCommentSchema),     async (req,res) => {


    //GETS the users input for the bugs id from the url
    const bugsId = req.bugId;
  
    // For this line to work you have to have the body parser thats up top MIDDLEWARE
    const newCommentFields = req.body  // An .body is an object lets our body read the Bugs id


    /*
    if(!newCommentFields.author){
      res.status(400).json({Error: `Please Enter A Authors Name`});
    }
    */

    if(!newCommentFields.message){
      res.status(400).json({Error: `Please Enter A Message for Your Comment`});
    }

    else{  // ------ SUCCESS ------
        try {

          // If the user is logged in then we will get THAT LOGGED IN USERS INFORMATION
          const getLoggedInUser = await getUserById(newId(req.auth._id))  // req.auth._id   gets the current cookie logged in user


          // Calls the function and uses the users entered id and body params for the values to pass into function
          const commentCreated = await newComment(bugsId, newCommentFields, getLoggedInUser);
  
          // If the Bugs Classification is updated once. It will gain a property called modifiedCount if this is 1 its true
          if(commentCreated.modifiedCount == 1){


              // eeeeeeeeee EDITS MADE eeeeeeeeee //
                // When the user successfully makes an account in the New Edits collection will show that this was done
                const editsMade = {
                  timeStamp: new Date(),
                  commentCreatedOn: new Date().toLocaleString('en-US'),
                  collection: "Bug",
                  operation: "New Comment",
                  commentOnBug: bugsId, // Shows bugs id thats classified
                  comment: newCommentFields.message, // shows what user put in the body.params
                  commentByUser: getLoggedInUser.fullName, // shows the cookie info for the logged in user
                  //fieldsUpdated: changesMadeByUserMessage, // Shows the message of what changed
                  auth: req.auth // Cookie information
                }

                // This is the function that pushes the editsMade array into the new Collection named Edits
                let updatesMade = await saveEdit(editsMade);
              // eeeeeeeeee EDITS MADE eeeeeeeeee //



            // Success Message
            res.status(200).json({Comment_Created: `Comment Added to Bug ${bugsId} by ${getLoggedInUser.fullName/*newCommentFields.author*/}`}); // Success Message
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
router.get("/:bugId/test/list",   isLoggedIn(), hasPermission("canViewData"),  validId("bugId"),   async (req, res) => {
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
    // If there is not even a test case array in the bug say this
    else if(allTestCasesInBug !== allTestCasesInBug.testCases){
      res.status(404).json({TestCase_Error: `No Test Cases Found in Bug ${bugId}` });
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
router.get("/:bugId/test/:testId",   isLoggedIn(), hasPermission("canViewData"),  validId("bugId"),    async (req, res) => {

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








// ++++++++++++++++ ADDING A NEW TEST CASE TO BUG ++++++++++++++++++    //http://localhost:5000/api/bugs/65241671c43c2e5dd553db87/test/new

// Step 1 Define the ADD NEW TEST CASE Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA


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

  // IF making it where user enters a ID in body.params
  // userId: 
  // Joi.string()
  // .trim()
  // .required()
  // .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
  //   'string.empty': 'Please Enter a Valid User Id', // If Comment is left blank
  //   'any.required': 'Please Enter a Valid User Id', // if the Comment is left uncheck marked and not entered
  // }),


  passed: Joi.string()
  .trim()
  // .valid(
  //   "True",
  //   "true",
  //   "False",
  //   "false"
  // )
  .required()
  .custom((value, helpers) => { // THIS HERE IS WHAT CAPITALIZES USERS INPUT
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    if (["True", "False"].includes(capitalizedValue)) {
      return capitalizedValue;
    } else {
      return helpers.message('Passed Must Be True or False');
    }
  })
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



router.put("/:bugId/test/new",  isLoggedIn(), hasPermission("canAddTestCase"),  validId("bugId"), validBody(addNewTestCaseSchema),     async (req,res) => {   

  
  
    //GETS the users input for the bugs id from the url
    const bugsId = req.bugId;
  
    // For this line to work you have to have the body parser thats up top MIDDLEWARE
    const newTestCaseFields = req.body

  
      // THIS USES THE SAME CODE AS FIND USER BY ID
      // This line will see if the users input == a _id of a user in the database
      //const userIdFound = await getUserById(newTestCaseFields.userId);


      // If the user is logged in then we will get THAT LOGGED IN USERS INFORMATION
      const getLoggedInUser = await getUserById(newId(req.auth._id))  // req.auth._id   gets the current cookie logged in user


      // If the logged in user has a role of QUALITY ANALYST THEY PASS
      // CHECK TO SEE IF THEIR ROLE HAS QUALITY ANALYST
      if(getLoggedInUser.role.includes("Quality Analyst")){ // SUCCESS
            // Success Message
            debugBug(`User ${getLoggedInUser.fullName} With a User Id ${getLoggedInUser._id} is a Quality Analyst.\n`); // Message Appears in terminal

          try {

            // Calls the function and uses the users entered id and body params for the values to pass into function
            const testCaseCreated = await newTestCase(bugsId, newTestCaseFields, getLoggedInUser);
    
            // If the Bug is updated once. It will gain a property called modifiedCount if this is 1 its true
            if(testCaseCreated.modifiedCount === 1){


                // eeeeeeeeee EDITS MADE eeeeeeeeee //
                  // When the user successfully makes an account in the New Edits collection will show that this was done
                  const editsMade = {
                    timeStamp: new Date(),
                    testCaseCreatedOn: new Date().toLocaleString('en-US'),
                    collection: "Bug",
                    operation: "New Test Case",
                    testCaseOnBug: bugsId, // Shows bugs id thats classified
                    testCaseAdded: newTestCaseFields.title, // shows what user put in the body.params for title
                    testCaseAddedByUser: getLoggedInUser.fullName, // shows the cookie info for the logged in user
                    testCasePassed: newTestCaseFields.passed, // true or false
                    auth: req.auth // Cookie information
                  }

                  // This is the function that pushes the editsMade array into the new Collection named Edits
                  let updatesMade = await saveEdit(editsMade);
                // eeeeeeeeee EDITS MADE eeeeeeeeee //


              // Success Message
              res.status(200).json({TestCase_Created: `Test Case Has Been Added to Bug ${bugsId} by ${getLoggedInUser.fullName}`}); // Success Message
              
              debugBug(`Test Case Has Been Added to Bug ${bugsId} by ${getLoggedInUser.fullName}`);
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
      else{               // Error Message for if user is not a QUALITY ANALYST
        res.status(404).json({Error: `User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id} Is Not a Quality Analyst`});
        debugBug(`User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id} Is Not a Quality Analyst`); // Message Appears in terminal
      }

  });

// ++++++++++++++++ ADDING A NEW TEST CASE TO BUG ++++++++++++++++++







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


  // userId: 
  // Joi.string()
  // .trim()
  // .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
  //   'string.empty': 'Please Enter a Valid User Id', // If userId is left blank
  // }),


  passed: Joi.string()
  .trim()
  // .valid(
  //   "True",
  //   "true",
  //   "False",
  //   "false"
  // )
  .custom((value, helpers) => { // THIS HERE IS WHAT CAPITALIZES USERS INPUT
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    if (["True", "False"].includes(capitalizedValue)) {
      return capitalizedValue;
    } else {
      return helpers.message('Passed Must Be True or False');
    }
  })
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




router.put("/:bugId/test/:testId",   isLoggedIn(),  hasPermission("canEditTestCase"),  validId("bugId"), validBody(updateTestCasesSchema),   async (req, res) => {


    // This gets the ID from the users input
    const bugsId = req.bugId; //


    // Gets the test case that is put in the url after /test/ HERE!!!
    const testCasesId= req.params.testId




    // For this line to work you have to have the body parser thats up top MIDDLEWARE
    const updatedTestCaseFields = req.body;  // An .body is an object in updatedBug lets our body read the users id


    // If the user is logged in then we will get THAT LOGGED IN USERS INFORMATION
    const getLoggedInUser = await getUserById(newId(req.auth._id))  // req.auth._id   gets the current cookie logged in user





    // If the logged in user has a role of QUALITY ANALYST THEY PASS
    // CHECK TO SEE IF THEIR ROLE HAS QUALITY ANALYST
    if(getLoggedInUser.role.includes("Quality Analyst")){ // SUCCESS
      // Success Message
      debugBug(`User ${getLoggedInUser.fullName} With a User Id ${getLoggedInUser._id} is a Quality Analyst.\n`); // Message Appears in terminal

      try {


                // ------ CHANGES MADE ------ //

                    // Gets the original data of the test case
                    const originalTestCase = await getTestCaseById(bugsId, testCasesId);
                    if (!originalTestCase) {
                      res.status(404).json({ Id_Error: `Bug Id ${bugsId} or Test Case Id ${testCasesId} Not Found` });
                      return;
                    }


                    // This is an empty array to store the changes the user makes
                    const changesMadeByUser = [];


                      // Compare the fields user enters to the original fields in getAllUsers()
                      for (const key in updatedTestCaseFields) {
                        if (originalTestCase[key] !== updatedTestCaseFields[key]) {
                          const change = {
                            field: key,
                            oldValue: originalTestCase[key],
                            newValue: updatedTestCaseFields[key]
                          };
                          changesMadeByUser.push(change);
                        }
                      }


                    // This is the message i will call down to display both the field changed and the value that was inputted
                    const changesMadeByUserMessage = changesMadeByUser.length > 0
                    ? changesMadeByUser.map(change => ` Field ${change.field} was '${change.oldValue}' ~ User ${getLoggedInUser.fullName} Changed ${change.field} to '${change.newValue}' `)
                    : 'No changes made';
                // ------ CHANGES MADE ------ //






        // Calls the function and uses the users entered id and body params for the values to pass into function
        const testCaseUpdated = await updateTestCase(bugsId, testCasesId, updatedTestCaseFields, getLoggedInUser);

        // If the Bug is updated once it will gain a property called modifiedCount if this is 1 its true
        if(testCaseUpdated.modifiedCount == 1){



                  // eeeeeeeeee EDITS MADE eeeeeeeeee //
                    // When the user successfully makes an account in the New Edits collection will show that this was done
                    const editsMade = {
                      timeStamp: new Date(),
                      testCaseUpdatedOn: new Date().toLocaleString('en-US'),
                      collection: "Bug",
                      operation: "Test Case Updated",
                      testCaseOnBug: bugsId, // Shows bugs id thats classified
                      testCaseUpdated: testCasesId, // shows what user put in the body.params for title
                      testCaseUpdatedByUser: getLoggedInUser.fullName, // shows the cookie info for the logged in user
                      changes_Made_To: changesMadeByUserMessage,
                      auth: req.auth // Cookie information
                    }

                    // This is the function that pushes the editsMade array into the new Collection named Edits
                    let updatesMade = await saveEdit(editsMade);
                  // eeeeeeeeee EDITS MADE eeeeeeeeee //



          // Success Message
          res.status(200).json({Bug_Updated: `Test Case ${testCasesId} updated`,  Changes_Made_To: changesMadeByUserMessage });
          //the length of the array of changes. IF array is 0? say message  'No changes made'
          //Changes_Made_To: changesMadeByUserArray.length > 0 ? changesMadeByUserArray : 'No changes made'}); // Success Message
          debugBug(`Test Case ${testCasesId} Updated`);
        }
        else{
          // Error Message when nothing has changed in the fields
          res.status(404).json({Update_Error: `Please Update a Field to Properly Apply Update to Test Case ${testCasesId}`});
          debugBug(`Please Update a Field to Properly Apply Update to Test Case ${testCasesId}`); // Message Appears in terminal
        }
      }
      catch (err) {
        res.status(500).json({Error: err.stack});
      }
    } // end of check user for being Quality Analyst
    else{ // User failed being a Quality Analyst
      res.status(404).json({Error: `User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id} Is Not a Quality Analyst`});
      debugBug(`User ${getLoggedInUser.fullName} With a User Id of ${getLoggedInUser._id} Is Not a Quality Analyst`); // Message Appears in terminal
    }
});
// uuuuuuuuuuuuuuuuu UPDATE A TEST CASE uuuuuuuuuuuuuuuuu






// -------------------- DELETING TEST CASE FROM A BUG -------------------   http://localhost:5000/api/bugs/65241671c43c2e5dd553db87/test/652567d8be0078c8eacf6685

router.delete("/:bugId/test/:testId",    isLoggedIn(),  hasPermission("canDeleteTestCase"),  validId("bugId"),    async (req, res) => {

  try {

  // were are getting a request with the parameters a user puts for the .id
  const bugsId = req.bugId;

  // Reads just the id of the comment entered
  const testCasesId = req.params.testId;

  debugBug(`bugsId: ${bugsId}`);
  debugBug(`TestCaseId: ${testCasesId}`);


  // Uses the Bug and Comments Id and plugs it into the deleteComment function
    const testCaseIsDeleted = await deleteTestCase(bugsId, testCasesId);

    // If the comment is deleted then success
    if(testCaseIsDeleted.modifiedCount == 1){
      // Success Message
      res.status(200).json({TestCase_Deleted: `Test Case ${testCasesId} Has Been Deleted`});
      debugBug(`Test Case ${testCasesId} Has Been Deleted`); // Message Appears in terminal
    }
    else{
      // Error Message
      res.status(404).json({Error: `Bug Id ${bugsId} or Test Case Id ${testCasesId} Not Found`});
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