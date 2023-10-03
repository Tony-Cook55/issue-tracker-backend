
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
import { connect, getAllUsers, getUserById, addNewUser, loginUser, updateUser, deleteUser} from "../../database.js";


// I I I I I I I    IMPORTS   I I I I I I I



router.use(express.urlencoded({extended:false}));







// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ // http://localhost:5000/api/users/list
router.get("/list", async (req, res) => {
  try {
    // Calls in the getAllUsers() Function from database.js finding all the Users
    const allUsers = await getAllUsers();

    // Success Message
    res.status(200).json(allUsers);

    debugUser("Success! Found All The Users\n"); // Message Appears in terminal
  }
  catch (err) { // Error Message
    res.status(500).json({error: err.stack});
  }
});
// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ //






//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/users/ (id of User)
// GETTING A USER BY THEIR userId
router.get("/:userId", async (req, res) => {   // the :userId   makes a param variable that we pass in
  try {

    // were are getting a request with the parameters a user puts for the .id
    const usersId = req.params.userId;

    // for every usersId return true when our _id is == to the id user enters
    const receivedUserId = await getUserById(usersId);


    if(receivedUserId){
      // Success Message
      res.status(200).json(receivedUserId);
      debugUser(`Success Got Users's Id: ${usersId} \n`); // Message Appears in terminal
    }
    else{
      // Error Message
      res.status(404).json(`User ${usersId} Not Found`);
      debugUser(`User ${usersId} Not Found\n`); // Message Appears in terminal
    }
  }
  catch (err) {
    // Error Message
    res.status(500).json({error: err.stack});
  }
});
//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!!!!!!








// ++++++++++++++++ ADDING A NEW USER TO THE ARRAY ++++++++++++++++++ http://localhost:5000/api/users/register
router.post("/register", async (req, res) => {

  // Getting the users data from the body like a form
  const newUser = req.body;


  //Call in our connect to database and then we find the email in the database then the users input
  const dbConnected = await connect();
  const emailExists = await dbConnected.collection("User").findOne({email: newUser.email});

    // If our email matches the email the user inputs throw this error
    if(emailExists){
      res.status(400).json({Error: "Email Already Registered"});
      debugUser(`Email Already Registered \n`); // Message Appears in terminal
    }
    // If there is not info in any of the fields throw error status. If not continue with adding user
    else if(!newUser){
      res.status(400).json({Error: "Please Enter Information for all Fields"});
    }
    else if(!newUser.email){
      res.status(400).json({Error: "Please Enter a Email"});
    }
    else if(!newUser.password){
      res.status(400).json({Error: "Please Enter a Password"});
    }
    else if(!newUser.fullName){
      res.status(400).json({Error: "Please Enter Your Full Name"});
    }
    else if(!newUser.givenName){
      res.status(400).json({Error: "Please Enter Your Given Name"});
    }
    else if(!newUser.familyName){
      res.status(400).json({Error: "Please Enter Your Family Name"});
    }
    else if(!newUser.role){
      res.status(400).json({Error: "Please Enter Your Role"});
    }
    else{  // !!!!!! SUCCESS !!!!!!
      try { // IF we have valid data for a new user do this


          // - USING BCRYPT HERE -  Literally delete this if you don't want the hashes
          // This will generate a salt round and hash the password entered to encrypt it
          newUser.password = await bcrypt.hash(newUser.password, 10)
          // - USING BCRYPT HERE -


          // ACTUALLY ADDS THE USERS INPUT HERE
            // Adds the users input from the body and plugs it into the addNewUser Function
            const addingNewUser = await addNewUser(newUser);
          // ACTUALLY ADDS THE USERS INPUT HERE


        // If user adding a new User is true it will be known as acknowledged
        if(addingNewUser.acknowledged == true){
          // Success Message
          res.status(200).json({message: `User ${newUser.fullName} Added With An Id of ${addingNewUser.insertedId}`});
          debugUser(`User ${newUser.fullName}  Added With An Id of ${addingNewUser.insertedId} \n`); // Message Appears in terminal
        }
        else{
          // Error Message
          res.status(400).json({error: `User ${newUser.fullName} Not Added`});
          debugUser(`User ${newUser.fullName} Not Added  \n`); // Message Appears in terminal
        }
      }
      catch (err) {
        res.status(500).json({error: err.stack});
      }
      }
});
// ++++++++++++++++ ADDING A NEW USER TO THE ARRAY ++++++++++++++++++









// /////////////// USER LOGIN WITH EMAIL & PASSWORD ///////////////// http://localhost:5000/api/users/login
router.post("/login", async (req, res) => {

    const usersLoginInformation = req.body; // Getting the users data from a body form

    // Inputs users input into the loginUser Function
    const usersLoggedIn = await loginUser(usersLoginInformation);

  try {
      // If there is not info in any of the fields or in either email or password throw error status.
      if(!usersLoginInformation){
        res.status(400).json({message: "Please Enter Your Login Credentials."});
      }
      else if(!usersLoginInformation.email){
        res.status(400).json({message: "Please Enter Your Email."});
      }
      else if(!usersLoginInformation.password){
        res.status(400).json({message: "Please Enter Your Password."});
      }
      else{
        // If our Database find finds the usersLoginInformation entered has the email and password set them to const variables
        const emailMatches = usersLoginInformation.email;
        const passwordMatches = usersLoginInformation.password;


        // If the email and password entered DO NOT MATCH anything in the Database from above throw error
        if(!emailMatches && !passwordMatches){
          res.status(404).json({message: `Invalid login credential provided. Please try again.`});
        }
        if(!emailMatches){ // If just email doesn't match
          res.status(404).json({message: `Invalid Email. Please Re-Enter Email.`});
        }
        else if(!passwordMatches){ // If just password doesn't match
          res.status(404).json({message: `Invalid Password. Please Re-Enter Password.`});
        }



        // !!!!! SUCCESS !!!!!
        // If usersLoginInformation Matches within our Database welcome back!  AND
        // If the entered password is the same as the password thats encrypted in database == Success
        if(usersLoggedIn && await bcrypt.compare(usersLoginInformation.password, usersLoggedIn.password)){
          // Success Message
          res.status(200).json(`Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In`);
          debugUser(`Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In`); // Message Appears in terminal
        }
        else{
          //Error
          res.status(400).json(`User Not Found`);
          debugUser(`User ${usersLoggedIn.fullName} Not Found`); // Message Appears in terminal
        }
      }
  } 
  catch (err) {
    res.status(500).json({error: err.stack});
  }
  
});
// /////////////// USER LOGIN WITH EMAIL & PASSWORD /////////////////










//```````````````````` UPDATE A USER ````````````````````  http://localhost:5000/api/users/ (ID here)
router.put("/:userId", async (req, res) => {

  // This gets the ID from the users input
  const userId = req.params.userId; // <--- .userId Must equal whatever is in the  router.put(/:WHATEVER IS HERE", (req, res) => {

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const updatedUserFields = req.body;  // An .body is an object in updatedBook lets our body read the users id
  // .body holds all the information/fields the user enters 


  // If the user inputs a password into the field we are going to make a new hash for it
  if(updatedUserFields.password){
          // - USING BCRYPT HERE -  Literally delete this if you don't want the hashes
          // This will generate a salt round and hash the password entered to encrypt it
          updatedUserFields.password = await bcrypt.hash(updatedUserFields.password, 10)
          // - USING BCRYPT HERE -
  }



  try {
    // Calls the function and uses the users entered id and body params for the values to pass into function
    const userUpdated = await updateUser(userId, updatedUserFields);

    // If the book is updated once it will gain a property called modifiedCount if this is 1 its true
    if(userUpdated.modifiedCount == 1){
      // Success Message
      res.status(200).json({message: `User ${userId} updated`}); // Success Message
      debugUser(`User ${userId} Updated`);
    }
    else{
      // Error Message
      res.status(400).json({error: `User ${userId} Not Found`});
      debugUser(`User ${userId} Not Found  \n`); // Message Appears in terminal
    }     
  } 
  catch (err) {
    res.status(500).json({error: err.stack});
  }
});
//```````````````````` UPDATE A USER ```````````````````` 







// -------------------- DELETING USER FROM DATABASE -------------------
router.delete("/:userId", async (req, res) => {

  // gets the id from the users url
  const usersId = req.params.userId; 


  try {
    // Uses the Users id and plugs it into the deleteUser function
      const deleteTheUser = await deleteUser(usersId);

      if(deleteTheUser.deletedCount == 1){
        // Success Message
        res.status(200).json({message: `User ${usersId} Deleted`});
        debugUser(`User ${usersId} Deleted  \n`); // Message Appears in terminal
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

