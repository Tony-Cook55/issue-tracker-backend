

// I I I I I I I    IMPORTS   I I I I I I I
import express from "express";

const router = express.Router();


import debug from "debug";
const debugBug = debug("app:BugRouter");

// IMPORTS NANOID
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdef', 10)


// Imports all the functions from the database.js file to CRUD Users              assignBugToUser Also Uses getUserById
import { connect, getAllBugs, getBugById, addNewBug, updateBug, updateClassification, assignBugToUser, getUserById, closeBug } from "../../database.js";


// I I I I I I I    IMPORTS   I I I I I I I



router.use(express.urlencoded({extended:false}));






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
    res.status(500).json({error: err.stack});
  }
});
// ~~~~~~~~~~~~~~~~ FIND ALL BUGS ~~~~~~~~~~~~~~~~ //





//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/bugs/ (id of User)
router.get("/:bugId", async (req, res) => {

  try {
    // Connects to the DB Using the connect Function
    const dbConnected = await connect();

    // were are getting a request with the parameters a user puts for the .id
    const bugsId = req.params.bugId;

    // for every bugsId return true when our _id is == to the id user enters
    const receivedBugId = await getBugById(bugsId);

    if(receivedBugId){
      // Success Message
      res.status(200).json(receivedBugId);
      debugBug(`Success Got Bugs Id: ${bugsId} \n`); // Message Appears in terminal
    }
    else{
      // Error Message
      res.status(404).json(`Bug ${bugsId} Not Found`);
      debugBug(`Bug ${bugsId} Not Found\n`); // Message Appears in terminal
    }

  }
  catch (err) {
    // Error Message
    res.status(500).json({error: err.stack});
  }

});
//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!







// ++++++++++++++++ ADDING A NEW BUG TO THE DATABASE ++++++++++++++++++   http://localhost:5000/api/bugs/new
router.post("/new", async (req, res) => {

    // Getting the users data from the body like a form
    const newBug = req.body;


    // If there is not info in any of these fields throw error status. If not continue with adding Bug
    if(!newBug.title && !newBug.description && !newBug.stepsToReproduce){
      res.status(400).json({message: "Please enter data for all fields"});
    }
    else if(!newBug.title){
      res.status(400).json({message: "Please enter data for the bugs Title"});
    }
    else if(!newBug.description){
      res.status(400).json({message: "Please enter data for the bugs Description"});
    }
    else if(!newBug.stepsToReproduce){
      res.status(400).json({message: "Please enter data for the bugs Reproduction Steps"});
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
          res.status(200).json({message: `Bug ${newBug.title} Added With An Id of ${addingNewBug.insertedId}`});
          debugBug(`Bug ${newBug.title}  Added With An Id of ${addingNewBug.insertedId} \n`); // Message Appears in terminal
        }
        else{
          // Error Message
          res.status(400).json({error: `Bug ${newBug.title} Not Added`});
          debugBug(`Bug ${newBug.title} Not Added  \n`); // Message Appears in terminal
        }
      }
      catch (err) {
        res.status(500).json({error: err.stack});
      }
    }
});
// ++++++++++++++++ ADDING A NEW BUG TO THE DATABASE ++++++++++++++++++








// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu  http://localhost:5000/api/bugs/ (ID here)
router.put("/:bugId", async (req, res) => {


    // This gets the ID from the users input
    const bugsId = req.params.bugId; //

    // For this line to work you have to have the body parser thats up top MIDDLEWARE
    const updatedBugFields = req.body;  // An .body is an object in updatedBug lets our body read the users id
    // .body holds all the information/fields the user enters


    try {
      // Calls the function and uses the users entered id and body params for the values to pass into function
      const bugUpdated = await updateBug(bugsId, updatedBugFields);

      // If the Bug is updated once it will gain a property called modifiedCount if this is 1 its true
      if(bugUpdated.modifiedCount == 1){
        // Success Message
        res.status(200).json({message: `Bug ${bugsId} updated`}); // Success Message
        debugBug(`Bug ${bugsId} Updated`);
      }
      else{
        // Error Message
        res.status(400).json({error: `Bug ${bugsId} Not Found`});
        debugBug(`Bug ${bugsId} Not Found  \n`); // Message Appears in terminal
      }
    }
    catch (err) {
      res.status(500).json({error: err.stack});
    }

});
// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu






// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc  http://localhost:5000/api/bugs/classify/(ID here)/
router.put("/:bugId/classify", async (req,res) => {

// OPTIONS TO CLASSIFY FOR: approved, unapproved, duplicate, by default unclassified


  //GETS the users input for the bugs id from the url
  const bugsId = req.params.bugId;

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const classifyBugFields = req.body;  // An .body is an object lets our body read the Bugs id
  // .body holds all the information/fields the user enters

  // If there is no input for classification error
  if(!classifyBugFields.classification){
    res.status(400).json({error: `Please Enter A Classification of: Approved, Unapproved, Duplicate, or Unclassified`});
  } // IF there is a response but it doesn't match Approved, Unapproved, Duplicate, or Unclassified error
  else if(classifyBugFields.classification != "Approved" || "approved"){
    res.status(400).json({error: `Please Enter A Classification of: Approved, Unapproved, Duplicate, or Unclassified`});
  }
  else if(classifyBugFields.classification != "Unapproved" || "unapproved"){
    res.status(400).json({error: `Please Enter A Classification of: Approved, Unapproved, Duplicate, or Unclassified`});
  }
  else if(classifyBugFields.classification != "Duplicate" || "duplicate"){
    res.status(400).json({error: `Please Enter A Classification of: Approved, Unapproved, Duplicate, or Unclassified`});
  }
  else{  // ------ SUCCESS ------
      try {
        // Calls the function and uses the users entered id and body params for the values to pass into function
        const bugClassified = await updateClassification(bugsId, classifyBugFields);

        // If the Bugs Classification is updated once. It will gain a property called modifiedCount if this is 1 its true
        if(bugClassified.modifiedCount == 1){
          // Success Message
          res.status(200).json({message: `Bug ${bugsId} Classified With a Classification of ${classifyBugFields.classification}`}); // Success Message
          debugBug(`Bug ${bugsId} Classified With a Classification of ${classifyBugFields.classification}`);
        }
        else{
          // Error Message
          res.status(404).json({error: `Bug ${bugsId} Not Found`});
          debugBug(`Bug ${bugsId} Not Found \n`); // Message Appears in terminal
        }
      }
      catch (err) {
        res.status(500).json({error: err.stack});
      }
    }
});
// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc








// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa  Bugs can be assigned to Developers, Business Analysts, and Quality Analysts.
router.put("/:bugId/assign", async (req,res) => {

  //GETS the users input for the bugs id from the url
  const bugsId = req.params.bugId;

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const assignBugFields = req.body;  // An .body is an object in updatedBook lets our body read the Bugs id
  // .body holds all the information/fields the user enters



  // If there is no input in the body field for the Users input throw this error
  if(!assignBugFields){
    res.status(404).json({message: `Bug ${bugsId} not found. Please Enter a User Id To assign Bug To The User`});
  }
  else if(!assignBugFields.assignedToUserId){
    res.status(400).json({message: `Please Enter a User Id To assign Bug To The User`});
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
              res.status(200).json({message: `Bug ${bugsId} Assigned to User ${userIdFound.fullName}`}); // Success Message
              debugBug(`Bug ${bugsId} Assigned to User ${userIdFound.fullName}`);
            }
            else{
              // Error Message
              res.status(404).json({error: `Bug ${bugsId} Not Found`});
              debugBug(`Bug ${bugsId} Not Found \n`); // Message Appears in terminal
            }
          }
          catch (err) {
            res.status(500).json({error: err.stack});
          }
    } // end of userIdFound Success If statement
    else{
      // IF THERE IS NO VALID USER ID FOUND BASED ON THE INPUT ERROR SHOWING THE ID THEY INPUTTED
      res.status(404).json(`User ${assignBugFields.assignedToUserId} Not Found`);
      debugBug(`User ${assignBugFields.assignedToUserId} Not Found\n`); // Message Appears in terminal
    }
  }

});
// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa











// xxxxxxxxxxxxxx CLOSE BUG xxxxxxxxxxxxxx
router.put("/:bugId/close", async (req,res) => {


  // This gets the ID from the users input
  const bugsId = req.params.bugId;

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const closedFields = req.body;  // An .body is an object in updatedBug lets our body read the users id
  // .body holds all the information/fields the user enters



  if(!closedFields.closed){
    res.status(400).json({error: `Please Enter True or False to Properly Close a Bug`});
    debugBug(`Bug Not Closed`);
  }
  else{
  // IF user Enters Closed or closed go ahead and Update it
    try {

      // Calls the function and uses the users entered id and body params for the values to pass into function
      const bugIsClosed = await closeBug(bugsId, closedFields);

      // If the Bug is updated once it will gain a property called modifiedCount if this is 1 its true
      if(bugIsClosed.modifiedCount == 1){
        // Success Message
        res.status(200).json({message: `Bug ${bugsId} Closed`}); // Success Message
        debugBug(`Bug ${bugsId} Closed`);
      }
      else{
        // Error Message
        res.status(404).json({error: `Bug ${bugsId} Not Found`});
        debugBug(`Bug ${bugsId} Not Found  \n`); // Message Appears in terminal
      }
    }
    catch (err) {
      res.status(500).json({error: err.stack});
    }
  }

});
// xxxxxxxxxxxxxx CLOSE BUG xxxxxxxxxxxxxx






export {router as BugRouter};






