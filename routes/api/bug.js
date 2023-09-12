
import express from "express";

const router = express.Router();


import debug from "debug";
const debugBug = debug("app:BugRouter");

// IMPORTS NANOID
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdef', 10)

router.use(express.urlencoded({extended:false}));


const bugsArray = [
  {
    "title": "Computer on fire",
    "description": "Fire spewing out of my Computer",
    "stepsToReproduce": "Throw Molotov on Computer",
    "id": "1",
  },
  {
    "title": "Fans not working",
    "description": "Pc's fans not spinning",
    "stepsToReproduce": "Start Pc, No Fans Spin",
    "id": "2",
  },
  {
    "title": "Pc explodes upon starting",
    "description": "Once on button is clicked Pc blows up",
    "stepsToReproduce": "Can only replicate once cause it exploded",
    "id": "3",
  },
  {
    "title": "Mouse is hot",
    "description": "My mouse is hot to the touch",
    "stepsToReproduce": "Put mouse in microwave, Touch mouse",
    "id": "4",
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
  if(!newBug.title){
    res.status(400).json({message: "Please enter data for the bugs Title"});
  }
  if(!newBug.description){
    res.status(400).json({message: "Please enter data for the bugs Description"});
  }
  if(!newBug.stepsToReproduce){
    res.status(400).json({message: "Please enter data for the bugs Reproduction Steps"});
  }

  else{

      // IF we have valid data for a new Bug do this and ADD it to array
      if(newBug){

        // Pushing/Adding our new Bugs fields into our bugsArray
        bugsArray.push(newBug); // pushes newBug info

        // This uses the nanoid we imported and the newUser.id attribute in the array will be a random nanoid
        newBug.id = nanoid();

        // Here we create a new item in the array called bugsCreationDate and we set the time it was made at for its value
        newBug.bugsCreationDate = new Date().toDateString();

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
  const updatedBug = req.body;  // An .body is an object in updatedBook lets our body read the Bugs id
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






// ~~~~~~~~~~~~~~~~~~~ CLASSIFY A BUG ~~~~~~~~~~~~~~~~~~~  http://localhost:5000/api/bugs/(ID here)/classify
router.put(":bugId/classify", (req,res) => {
//FIXME: CLASSIFY BUG AND SEND RESPONSE AS JSON
});
// ~~~~~~~~~~~~~~~~~~~ CLASSIFY A BUG ~~~~~~~~~~~~~~~~~~~







router.put(":bugId/assign", (req,res) => {
  //FIXME: ASSIGN BUG TO A USER AND SEND RESPONSE AS JSON
});


router.put(":bugId/close", (req,res) => {
  //FIXME: CLOSE BUG AND SEND RESPONSE AS JSON
});


export {router as BugRouter};






