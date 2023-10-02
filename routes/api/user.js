
// I I I I I I I    IMPORTS   I I I I I I I
import express from "express";


const router = express.Router();


import debug from "debug";
const debugUser = debug("app:UserRouter");


// IMPORTS NANOID
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdef', 10)


//This allows us to encrypt our passwords using this: npm i bcrypt
import bcrypt from "bcrypt";


// Imports all the functions from the database.js file to CRUD Users
import { connect, getAllUsers, getUserById, addNewUser, emailAlreadyExistsCheck,  deleteUser} from "../../database.js";


// I I I I I I I    IMPORTS   I I I I I I I



router.use(express.urlencoded({extended:false}));







// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ // http://localhost:5000/api/users/list

router.get("/list", async (req, res) => {
  try {
    // Connects to the DB Using the connect Function
    const dbConnected = await connect();

    // Calls in the getAllUsers() Function from database.js finding all the Users
    const allUsers = await getAllUsers();

    // Success Message
    res.status(200).json(allUsers);
    debugUser("Success! Found All The Users\n"); // Message Appears in terminal

  }
  catch (err) { // Error Message
    res.status(500).json({error: err.stack});
    debugUser("Error When Finding All Users\n"); // Message Appears in terminal
  }
});
// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ //






//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/users/ (id of User)
// GETTING A USER BY THEIR userId
router.get("/:userId", async (req, res) => {   // the :userId   makes a param variable that we pass in
  try {
    // Connects to the DB Using the connect Function
    const dbConnected = await connect();

    // were are getting a request with the parameters a user puts for the .id
    const usersId = req.params.userId;

    // for every usersId return true when our _id is == to the id user enters
    const receivedUserId = await getUserById(usersId);

    // Success Message
    res.status(200).json(receivedUserId);

    debugUser(`Success Got Users's Id: ${usersId} \n`); // Message Appears in terminal
  }
  catch (err) {
    // Error Message
    res.status(500).json({error: err.stack});
    debugUser(`Error Finding Users Id: ${usersId} Not Found \n`); // Message Appears in terminal
  }
});
//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!!!!!!








// ++++++++++++++++ ADDING A NEW USER TO THE ARRAY ++++++++++++++++++ http://localhost:5000/api/users/register
router.post("/register", async (req, res) => {

  // Getting the users data from the body like a form
  const newUser = req.body;

  // Adds the users input from the body and plugs it into the addNewUser Function
  const addingNewUser = await addNewUser(newUser);


  const emailAlreadyExists = await emailAlreadyExistsCheck(newUser.email);


  debugUser(`${emailAlreadyExists}`);
  
  try {

    if(emailAlreadyExists){
      debugUser(`EMAIL EXISTS!!!  \n`); // Message Appears in terminal
      res.status(200).json({Error: `Email ${addingNewUser.email} Already Exists`});
      debugUser(`Email ${addingNewUser.email} Already Exists \n`); // Message Appears in terminal
    }
    else{
      res.status(200).json({Error: `yes it is there`});
      debugUser(`yes it is there \n`); // Message Appears in terminal
    }

  }
  catch (err) {
    res.status(500).json({error: err.stack});
  }








});
// ++++++++++++++++ ADDING A NEW USER TO THE ARRAY ++++++++++++++++++






// /////////////// USER LOGIN IN EMAIL & PASSWORD ///////////////// http://localhost:5000/api/users/login
router.post("/login", async (req, res) => {

  const usersLogin = req.body; // Getting the users data from a form

  // If there is not info in any of the fields or in either email or password throw error status.
  if(!usersLogin){
    res.status(400).json({message: "Please Enter Your Login Credentials."});
  }
  else if(!usersLogin.email){
    res.status(400).json({message: "Please Enter Your Email."});
  }
  else if(!usersLogin.password){
    res.status(400).json({message: "Please Enter Your Password."});
  }
  else{

    // If our array find finds the usersLogin entered has the email and password set them to const variables
    const emailMatches = usersArray.find((enteredEmail) => enteredEmail.email == usersLogin.email);
    const passwordMatches = usersArray.find((enteredPassword) => enteredPassword.password == usersLogin.password);

    // If the email and password entered DO NOT MATCH anything in the array from above throw error
    if(!emailMatches && !passwordMatches){
      res.status(404).json({message: `Invalid login credential provided. Please try again.`});
    }
    if(!emailMatches){ // If just email doesn't match
      res.status(404).json({message: `Invalid Email. Please Re-Enter Email.`});
    }
    else if(!passwordMatches){ // If just password doesn't match
      res.status(404).json({message: `Invalid Password. Please Re-Enter Password.`});
    }


    // If usersLogin Matches within our array welcome back!
    if(usersLogin){
      res.status(200).json({message: `Welcome back!`});
    }
  }
});
// /////////////// USER LOGIN IN EMAIL & PASSWORD /////////////////






//```````````````````` UPDATE A USER ````````````````````  http://localhost:5000/api/users/ (ID here)
router.put("/:userId", async (req, res) => {

  // This gets the ID from the users input
  const userId = req.params.userId; // <--- .userId Must equal whatever is in the  router.put(/:WHATEVER IS HERE", (req, res) => {

  // Looks for the id user entered to see if its in array
  const currentUser = usersArray.find(currentId => currentId.id == userId);

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const updatedUser = req.body;  // An .body is an object in updatedBook lets our body read the users id
  // .body holds all the information/fields the user enters 



  // If currentUser is true go through update process
  if(currentUser){
    for(const key in updatedUser){  // loops through the keys in the updated User (email, password, fullName, etc.)
      if(currentUser[key] != updatedUser[key]){ // if the current Users key(fullName for ex.) is not == to the updated User 
        currentUser[key] = updatedUser[key]; // go ahead and update it
      }
    }


    // We will save the current User back into the array
    const usersPositionInArray = usersArray.findIndex(currentId => currentId.id == userId);
    if(usersPositionInArray != -1){
      usersArray[usersPositionInArray] = currentUser; // saving Users data back into the array

      // Here we create a new item in the array called lastUpdated and we set the time it was made at for its value
      currentUser.lastUpdated = new Date().toDateString();
    }

    res.status(200).json({message: `User ${userId} updated`}); // Success Message

}
else{ // ERROR MESSAGE
  res.status(404).json({message: `User ${userId} not found.`});
}



});
//```````````````````` UPDATE A USER ```````````````````` 







// -------------------- DELETING USER FROM DATABASE -------------------
router.delete("/:userId", async (req, res) => {
  //FIXME: DELETE USER AND SEND RESPONSE AS JSON


  // gets the id from the users url
  const usersId = req.params.userId; 


  try {
    // Uses the Users id and plugs it into the deleteUser function
      const deleteTheUser = await deleteUser(usersId);

      if(deleteTheUser.deletedCount == 1){
        // Success Message
        res.status(200).json({message: `User ${usersId} Deleted`});
        debugUser(`User ${deleteTheUser.fullName} Deleted  \n`); // Message Appears in terminal
      }
      else{
        // Error Message
        res.status(400).json({error: `User ${usersId} Not Deleted`});
        debugUser(`User ${usersId} Not Deleted\n`); // Message Appears in terminal
      }
  }
  catch (err) {
    res.status(500).json({error: err.stack});
  }

});
// -------------------- DELETING USER FROM DATABASE -------------------















export {router as UserRouter};

