

// I I I I I I I    IMPORTS   I I I I I I I
import express from "express";

const router = express.Router();


import debug from "debug";
const debugBug = debug("app:BugRouter");

// IMPORTS NANOID
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdef', 10)
// I I I I I I I    IMPORTS   I I I I I I I



router.use(express.urlencoded({extended:false}));


const bugsArray = [
  {
    "title": "Computer on fire",
    "description": "Fire spewing out of my Computer",
    "stepsToReproduce": "Throw Molotov on Computer",
    "classification": "",
    "classifiedOn": "",
    "id": "1",
    "bugsCreationDate": "",
    "lastUpdated": "",
  },
  {
    "title": "Fans not working",
    "description": "Pc's fans not spinning",
    "stepsToReproduce": "Start Pc, No Fans Spin",
    "classification": "",
    "classifiedOn": "",
    "id": "2",
    "bugsCreationDate": "",
    "lastUpdated": "",
  },
  {
    "title": "Pc explodes upon starting",
    "description": "Once on button is clicked Pc blows up",
    "stepsToReproduce": "Can only replicate once cause it exploded",
    "classification": "",
    "classifiedOn": "",
    "id": "3",
    "bugsCreationDate": "",
    "lastUpdated": "",
  },
  {
    "title": "Mouse is hot",
    "description": "My mouse is hot to the touch",
    "stepsToReproduce": "Put mouse in microwave, Touch mouse",
    "classification": "",
    "classifiedOn": "",
    "id": "4",
    "bugsCreationDate": "",
    "lastUpdated": "",
  },
];



// GETS THE LIST OF ALL BUGS FROM THE bugsArray    http://localhost:5000/api/bugs/list
router.get("/list", (req, res) => {
  debugBug("Bug List Route Hit");
  res.json(bugsArray);
});
// GETS THE LIST OF ALL BUGS FROM THE bugsArray





//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/bugs/ (id of User)
router.get("/:bugId", (req, res) => {

  //READS THE bugId from the URL and stores it in a variable
  const bugId = req.params.bugId;

  // This finds the input the user put and if it matches an ID it will get it and display
  const getBugsId = bugsArray.find(findBugsId => findBugsId.id == bugId);

  // If we get the bugs id show it
  if(getBugsId){
    res.status(200).json(getBugsId); // SUCCESS MESSAGE
  }
  else{ // Error message
    res.status(404).json({message: `Bug ${bugId} not found`}); // ERROR MESSAGE
  }

});
//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!







// ++++++++++++++++ ADDING A NEW BUG TO THE ARRAY ++++++++++++++++++   http://localhost:5000/api/bugs/new
router.post("/new", (req, res) => {

  const newBug = req.body; // Getting the new Bugs data from the body form


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

  else{

      // IF we have valid data for a new Bug do this and ADD it to array
      if(newBug){

        // This uses the nanoid we imported and the newUser.id attribute in the array will be a random nanoid
        newBug.id = nanoid();

        // Here we create a new item in the array called bugsCreationDate and we set the time it was made at for its value
        newBug.bugsCreationDate = new Date().toDateString();


        // Pushing/Adding our new Bugs fields into our bugsArray
        bugsArray.push(newBug); // pushes newBug info


        // Good Message
        res.status(200).json({message: `The New Bug ${newBug.title} Has Been Successfully Reported`}); // SUCCESS MESSAGE
      }
  }

});
// ++++++++++++++++ ADDING A NEW BUG TO THE ARRAY ++++++++++++++++++







//```````````````````` UPDATE A BUG ````````````````````  http://localhost:5000/api/bugs/ (ID here)

router.put("/:bugId", (req, res) => {

  //GETS the users input for the bugs id from the url
  const bugsId = req.params.bugId;

  // Looks for the id user entered to see if its in array
  const currentBug = bugsArray.find(currentBugId => currentBugId.id == bugsId);

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const updatedBug = req.body;  // An .body is an object lets our body read the Bugs id
  // .body holds all the information/fields the user enters



  // If currentBug is true go through update process
  if(currentBug){
    for(const key in updatedBug){  // loops through the keys in the updated Bug (title, description, stepsToReproduce.)
      if(currentBug[key] != updatedBug[key]){ // if the current Users key(title for ex.) is not == to the updated Bug
        currentBug[key] = updatedBug[key]; // go ahead and update it
      }
    }


    // We will save the current Bug back into the array
    const bugsPositionInArray = bugsArray.findIndex(currentBugId => currentBugId.id == bugsId);
    if(bugsPositionInArray != -1){
      bugsArray[bugsPositionInArray] = currentBug; // saving Users data back into the array

      // Here we create a new item in the array called lastUpdated and we set the time it was made at for its value
      currentBug.lastUpdated = new Date().toDateString();
    }

    res.status(200).json({message: `Bug ${bugsId} updated`}); // Success Message

}
else{ // ERROR MESSAGE
  res.status(404).json({message: `Bug ${bugsId} not found.`});
}


});
//```````````````````` UPDATE A BUG ````````````````````






// ~~~~~~~~~~~~~~~~~~~ CLASSIFY A BUG ~~~~~~~~~~~~~~~~~~~  http://localhost:5000/api/bugs/classify/(ID here)/
router.put("/:bugId/classify", (req,res) => {

  //GETS the users input for the bugs id from the url
  const bugsId = req.params.bugId;

  // Looks for the id user entered to see if its in array
  const currentBug = bugsArray.find(currentBugId => currentBugId.id == bugsId);

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const classifyBug = req.body;  // An .body is an object lets our body read the Bugs id
  // .body holds all the information/fields the user enters




  // If ID inputted is wrong
  if(!currentBug){ // ERROR MESSAGE
    res.status(404).json({message: `Bug ${bugsId} not found.`});
  }

  // If there is no input in the body field for the classification throw this error
  if(!classifyBug.classification){
    res.status(404).json({message: `Please Enter a Classification`});
  }


  // If currentBug is true go through update process
  if(classifyBug){
      for(const key in classifyBug){  // loops through the keys in the updated Bug (classification)
        if(currentBug[key] != classifyBug[key]){ // if the current Users key(classification for ex.) is not == to the updated Bug
          currentBug[key] = classifyBug[key]; // go ahead and update it
        }
      }


      // We will save the current Bug back into the array
      const bugsPositionInArray = bugsArray.findIndex(currentBugId => currentBugId.id == bugsId);
      if(bugsPositionInArray != -1){
        bugsArray[bugsPositionInArray] = currentBug; // saving Users data back into the array


        // Create and set the date this bug is classifiedOn
        currentBug.classifiedOn = new Date().toDateString();

        // Here we create a new item in the array called lastUpdated and we set the time it was made at for its value
        currentBug.lastUpdated = new Date().toDateString();
      }

      res.status(200).json({message: `Bug Classified`}); // Success Message

  }
});
// ~~~~~~~~~~~~~~~~~~~ CLASSIFY A BUG ~~~~~~~~~~~~~~~~~~~








// ^^^^^^^^^^^^^^^^^^ ASSIGN A BUG ^^^^^^^^^^^^^^^^^^
router.put("/:bugId/assign", (req,res) => {

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






