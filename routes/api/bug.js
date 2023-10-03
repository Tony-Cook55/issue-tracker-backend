

// I I I I I I I    IMPORTS   I I I I I I I
import express from "express";

const router = express.Router();


import debug from "debug";
const debugBug = debug("app:BugRouter");

// IMPORTS NANOID
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdef', 10)


// Imports all the functions from the database.js file to CRUD Users
import { connect, getAllBugs, getBugById, addNewBug, updateBug, updateClassification } from "../../database.js";


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







// ++++++++++++++++ ADDING A NEW BUG TO THE ARRAY ++++++++++++++++++   http://localhost:5000/api/bugs/new
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
// ++++++++++++++++ ADDING A NEW BUG TO THE ARRAY ++++++++++++++++++








//```````````````````` UPDATE A BUG ````````````````````  http://localhost:5000/api/bugs/ (ID here)
router.put("/:bugId", async (req, res) => {


    // This gets the ID from the users input
    const bugsId = req.params.bugId; // <--- .bugsId Must equal whatever is in the  router.put(/:WHATEVER IS HERE", (req, res) => {
  
    // For this line to work you have to have the body parser thats up top MIDDLEWARE
    const updatedBugFields = req.body;  // An .body is an object in updatedBug lets our body read the users id
    // .body holds all the information/fields the user enters 
  
  
    try {
      // Calls the function and uses the users entered id and body params for the values to pass into function
      const bugUpdated = await updateBug(bugsId, updatedBugFields);
  
      // If the book is updated once it will gain a property called modifiedCount if this is 1 its true
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
//```````````````````` UPDATE A BUG ````````````````````






// ~~~~~~~~~~~~~~~~~~~ CLASSIFY A BUG ~~~~~~~~~~~~~~~~~~~  http://localhost:5000/api/bugs/classify/(ID here)/
router.put("/:bugId/classify", async (req,res) => {

  //GETS the users input for the bugs id from the url
  const bugsId = req.params.bugId;

  // Looks for the id user entered to see if its in array
  const currentBug = bugsArray.find(currentBugId => currentBugId.id == bugsId);

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const classifyBugFields = req.body;  // An .body is an object lets our body read the Bugs id
  // .body holds all the information/fields the user enters

    // asdasdasdasdasd FIXME: CHANGE ALL OF THE THINGS BELOW TO WORK 
      try {
        // Calls the function and uses the users entered id and body params for the values to pass into function
        const bugUpdated = await updateBug(bugsId, updatedBugFields);
    
        // If the book is updated once it will gain a property called modifiedCount if this is 1 its true
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
// ~~~~~~~~~~~~~~~~~~~ CLASSIFY A BUG ~~~~~~~~~~~~~~~~~~~








// ^^^^^^^^^^^^^^^^^^ ASSIGN A BUG ^^^^^^^^^^^^^^^^^^
router.put("/:bugId/assign", async (req,res) => {

  //GETS the users input for the bugs id from the url
  const bugsId = req.params.bugId;

  // Looks for the id user entered to see if its in array
  const currentBug = bugsArray.find(currentBugId => currentBugId.id == bugsId);

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const assignBug = req.body;  // An .body is an object in updatedBook lets our body read the Bugs id
  // .body holds all the information/fields the user enters




  // If ID inputted is wrong
  if(!currentBug){ // ERROR MESSAGE
    res.status(404).json({message: `Bug ${bugsId} not found.`});
  }


  // If there is no input in the body field for the Users Id or UsersName throw this error
  if(!assignBug.assignedToUserId && !assignBug.assignedToUserName){
    res.status(404).json({message: `Please Enter a User Id and a Users Name To assign Bug To`});
  }
  else if(!assignBug.assignedToUserId){
    res.status(404).json({message: `Please Enter a User Id To assign Bug To`});
  }
  else if(!assignBug.assignedToUserName){
    res.status(404).json({message: `Please Enter a Users Name To assign Bug To`});
  }


  // If currentBug is true go through update process
  if(assignBug){
      for(const key in assignBug){  // loops through the keys in the assignBug (assignedToUserId, assignedToUserName)
        if(currentBug[key] != assignBug[key]){ // if the current Users key(assignedToUserName for ex.) is not == to the updated Bug
          currentBug[key] = assignBug[key]; // go ahead and update it
        }
      }


      // We will save the current Bug back into the array
      const bugsPositionInArray = bugsArray.findIndex(currentBugId => currentBugId.id == bugsId);
      if(bugsPositionInArray != -1){
        bugsArray[bugsPositionInArray] = currentBug; // saving Users data back into the array


        // Create and set the date this bug is assignedOn
        currentBug.assignedOn = new Date().toDateString();

        // Here we create a new item in the array called lastUpdated and we set the time it was made at for its value
        currentBug.lastUpdated = new Date().toDateString();
      }

      res.status(200).json({message: `Bug Assigned`}); // Success Message

  }

});
// ^^^^^^^^^^^^^^^^^^ ASSIGN A BUG ^^^^^^^^^^^^^^^^^^


















// xxxxxxxxxxxxxx CLOSE BUG xxxxxxxxxxxxxx
router.put("/:bugId/close", (req,res) => {

  //GETS the users input for the bugs id from the url
  const bugsId = req.params.bugId;

  // Looks for the id user entered to see if its in array
  const currentBug = bugsArray.find(currentBugId => currentBugId.id == bugsId);

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const closeBug = req.body;  // An .body is an object in updatedBook lets our body read the Bugs id
  // .body holds all the information/fields the user enters




  // If ID inputted is wrong
  if(!currentBug){ // ERROR MESSAGE
    res.status(404).json({message: `Bug ${bugsId} not found.`});
  }


  // If there is no input in the body field for the closed throw this error
  if(!closeBug.closed){
    res.status(404).json({message: `Please Enter Information to Close the Bug`});
  }


  // If currentBug is true go through update process
  if(closeBug){
      for(const key in closeBug){  // loops through the keys in the assignBug (closed)
        if(currentBug[key] != closeBug[key]){ // if the current Users key(closed for ex.) is not == to the updated Bug
          currentBug[key] = closeBug[key]; // go ahead and update it
        }
      }


      // We will save the current Bug back into the array
      const bugsPositionInArray = bugsArray.findIndex(currentBugId => currentBugId.id == bugsId);
      if(bugsPositionInArray != -1){
        bugsArray[bugsPositionInArray] = currentBug; // saving Users data back into the array


        // Create and set the date this bug is closedOn
        currentBug.closedOn = new Date().toDateString();

        // Here we create a new item in the array called lastUpdated and we set the time it was made at for its value
        currentBug.lastUpdated = new Date().toDateString();
      }

      res.status(200).json({message: `Bug Closed`}); // Success Message

  }


});
// xxxxxxxxxxxxxx CLOSE BUG xxxxxxxxxxxxxx






export {router as BugRouter};






