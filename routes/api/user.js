
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



// CALLS IN THE MIDDLEWARE FUNCTION     - JOI
import Joi from "joi";

import { validId } from "../../middleware/validId.js";

import { validBody } from "../../middleware/validBody.js";

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
    res.status(500).json({Error: err.stack});
  }
});
// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ //






//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!   http://localhost:5000/api/users/ (id of User)

// GETTING A USER BY THEIR userId
// What ever is in the .get("/:HERE!") you must make it the same as what in validId("HERE!")
router.get("/:userId",   validId("userId"),    async (req, res) => {   // the :userId   makes a param variable that we pass in
  try {


    // USING JOI SO WE DON'T NEED THE .params to get users res
    const usersId = req.userId;  // We don't need to have .params is due to the validId("id") is using the id from the params in function


    // were are getting a request with the parameters a user puts for the .id
    //const usersId = req.params.userId;

    // for every usersId return true when our _id is == to the id user enters
    const receivedUserId = await getUserById(usersId);


    if(receivedUserId){
      // Success Message
      res.status(200).json(receivedUserId);
      debugUser(`Success, Got "${receivedUserId.fullName}" Id: ${usersId}\n`); // Message Appears in terminal
    }
    else if(!usersId){
      debugUser(`DEAR GOD`); // Message Appears in terminal
    }
    else{
      // Error Message
      res.status(404).json({Id_Error: `User ${usersId} Not Found`});
      debugUser(`User ${usersId} Not Found\n`); // Message Appears in terminal
    }
  }
  catch (err) {
    // Error Message
    res.status(500).json({Error: err.stack});
  }
});
//!!!!!!!!!!!!!!!!!!  SEARCHING BY ID !!!!!!!!!!!!!!!!!!!!!








// ++++++++++++++++ ADDING A NEW USER TO THE DATABASE ++++++++++++++++++ http://localhost:5000/api/users/register



// Step 1 Define the Login User Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const registerUserSchema = Joi.object({


  password: Joi.string()
  .trim()
  .min(8)
  .max(50)
  .required()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Password Is Required', // If password is left blank
    'string.min': 'Password must be at least {#limit} characters long',  // if less than 8 characters
    'string.max': 'Password must be at most {#limit} characters long', // if more than 50 characters
    'any.required': 'Password is required', // if the password is left uncheck marked and not entered
  }),


  email: Joi.string()
  .trim()
  .email({ tlds: { allow: false } })
  .required()
  .messages({
    'string.empty': 'Email is required', // if email is left empty
    'string.email': 'Email must be a valid email address', // if email does not contain an @HERE.com
    'any.required': 'Email is required', // if email is left uncheck marked and not entered
  }),


  fullName: Joi.string()
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'any.required': 'Full name is required',
    }),


    givenName: Joi.string()
    .required()
    .messages({
      'string.empty': 'Given name is required',
      'any.required': 'Given name is required',
    }),


    familyName: Joi.string()
    .required()
    .messages({
      'string.empty': 'Family name is required',
      'any.required': 'Family name is required',
    }),


    role: Joi.array().items(
      Joi.string()
      .lowercase() // Doesn't matter how user types it Capital or Not
      .valid(  // IF the user enters anything other than these it will not be valid
      "Developer",
      "Business Analysts",
      "Quality Analyst",
      "Product Manager",
      "Technical Manager",
      )
    )
    .required()
    .min(1) // Minimum of at least one role
    .max(5) // Maximum of five roles
    .messages({
      'string.empty': 'Role is required',
      'any.required': 'Role is required',
      'array.base': 'Roles must be an array',
      'array.min': 'At least one role must be provided',
      'array.max': 'A maximum of five roles can be provided',
      'string.valid': 'Invalid role selected',
    }),


  }); // END OF registerUserSchema




router.post("/register",  validBody(registerUserSchema),   async (req, res) => {

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
          res.status(200).json({User_Added: `User ${newUser.fullName} Added With An Id of ${addingNewUser.insertedId}`});
          debugUser(`User ${newUser.fullName} Added With An Id of ${addingNewUser.insertedId} \n`); // Message Appears in terminal
        }
        /////// IF NO JOI USE BACK UP IS STATEMENTS ///////
        // // If there is not info in any of the fields throw error status. If not continue with adding user
        // else if(!newUser){
        //   res.status(400).json({Error: "Please Enter Information for all Fields"});
        // }
        // else if(!newUser.email){
        //   res.status(400).json({Email_Error: "Please Enter a Email"});
        // }
        // else if(!newUser.password){
        //   res.status(400).json({Password_Error: "Please Enter a Password"});
        // }
        // else if(!newUser.fullName){
        //   res.status(400).json({Full_Name_Error: "Please Enter Your Full Name"});
        // }
        // else if(!newUser.givenName){
        //   res.status(400).json({Given_Name_Error: "Please Enter Your Given Name"});
        // }
        // else if(!newUser.familyName){
        //   res.status(400).json({Family_Name_Error: "Please Enter Your Family Name"});
        // }
        // else if(!newUser.role){
        //   res.status(400).json({Role_Error: "Please Enter Your Role"});
        // }
        else{
          // Error Message
          res.status(400).json({Error: `User ${newUser.fullName} Not Added`});
          debugUser(`User ${newUser.fullName} Not Added  \n`); // Message Appears in terminal
        }
      }
      catch (err) {
        res.status(500).json({Error: err.stack});
      }
      }
});
// ++++++++++++++++ ADDING A NEW USER TO THE DATABASE ++++++++++++++++++









// /////////////// USER LOGIN WITH EMAIL & PASSWORD ///////////////// http://localhost:5000/api/users/login



// Step 1 Define the Login User Schema    THESE WILL BE THE RULE SET FOR THE INPUTTED DATA
const loginUserSchema = Joi.object({
  password: Joi.string()
  .trim()
  .min(8)
  .max(50)
  .required()
  .messages({ // These are custom messages that will show based on the "type": "string.empty", that throws on an error
    'string.empty': 'Your Password Is Required', // If password is left blank
    'string.min': 'Your Password must be at least {#limit} characters long',  // if less than 8 characters
    'string.max': 'Your Password must be at most {#limit} characters long', // if more than 50 characters
    'any.required': 'Your Password is required', // if the password is left uncheck marked and not entered
  }),


  email: Joi.string()
  .trim()
  .email({ tlds: { allow: false } })
  .required()
  .messages({
    'string.empty': 'Your Email is required', // if email is left empty
    'string.email': 'Your Email must be a valid email address', // if email does not contain an @HERE.com
    'any.required': 'Your Email is required', // if email is left uncheck marked and not entered
  }),
})





router.post("/login",   validBody(loginUserSchema),   async (req, res) => {

    const usersLoginInformation = req.body; // Getting the users data from a body form

    // Inputs users input into the loginUser Function
    const usersLoggedIn = await loginUser(usersLoginInformation);

  try {
      /////// IF NO JOI USE BACK UP IF STATEMENTS ///////
      // // If there is not info in any of the fields or in either email or password throw error status.
      // if(!usersLoginInformation){
      //   res.status(400).json({Error: "Please Enter Your Login Credentials."});
      // }
      // else if(!usersLoginInformation.email){
      //   res.status(400).json({Email_Error: "Please Enter Your Email."});
      // }
      // else if(!usersLoginInformation.password){
      //   res.status(400).json({Password_Error: "Please Enter Your Password."});
      // }
      // else{


        // If our Database find finds the usersLoginInformation entered has the email and password set them to const variables



        // !!!!! SUCCESS !!!!!
        // If usersLoginInformation Matches within our Database welcome back!  AND
        // If the entered password is the same as the password thats encrypted in database == Success
        if(usersLoggedIn && await bcrypt.compare(usersLoginInformation.password, usersLoggedIn.password)){
          // Success Message
          res.status(200).json({Welcome_Back: `Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In`});
          debugUser(`Welcome ${usersLoggedIn.fullName} You Are Successfully Logged In`); // Message Appears in terminal
        }


        asdasdaskdhadajsdakdjaskjdlasdlakdsasld
        //If just email doesn't match
        else if(usersLoginInformation.email != usersLoggedIn.email){
          res.status(400).json({Error: `Invalid Email. Please Re-Enter Email.`});
          debugUser(`Invalid Email. Please Re-Enter Email.`); // Message Appears in terminal
        }
        // If just password doesn't match
        else if(usersLoginInformation.password != usersLoggedIn.password){
          res.status(400).json({Error: `Invalid Password. Please Re-Enter Password.`});
          debugUser(`Invalid Password. Please Re-Enter Password.`); // Message Appears in terminal
        }


        else{ // xxxxxx ERROR xxxxxxx
          //Error
          res.status(400).json({Error: `User Not Found`});
          debugUser(`User ${usersLoggedIn.fullName} Not Found`); // Message Appears in terminal
        }
      }
  catch (err) {
    res.status(500).json({Error: err.stack});
  }

});
// /////////////// USER LOGIN WITH EMAIL & PASSWORD /////////////////










// uuuuuuuuuuuuuuuuu UPDATE A USER uuuuuuuuuuuuuuuuu  http://localhost:5000/api/users/ (ID here)
router.put("/:userId", async (req, res) => {

  // This gets the ID from the users input
  const userId = req.params.userId;

  // For this line to work you have to have the body parser thats up top MIDDLEWARE
  const updatedUserFields = req.body;  // An .body is an object in updatedBug lets our body read the users id
  // .body holds all the information/fields the user enters


  // If the user inputs a password into the field we are going to make a new hash for it
  if(updatedUserFields.password){
          // - USING BCRYPT HERE -  Literally delete this if you don't want the hashes
          // This will generate a salt round and hash the password entered to encrypt it
          updatedUserFields.password = await bcrypt.hash(updatedUserFields.password, 10)
          // - USING BCRYPT HERE -
  }



  try {
              // ------ CHANGES MADE ------ //    Ill be honest I tried to implement this my self but couldn't so this is ChatGBT
                // This is an empty array to store the changes the user makes
                const changesMadeByUserArray = [];

                // Retrieve the original user data from our database using same code from Get All Users
                const originalUsersData = await getAllUsers(userId);

                  // Compare the fields user enters to the original fields in getAllUsers()
                  for (const key in updatedUserFields) {
                    if (originalUsersData[key] !== updatedUserFields[key]) {
                      changesMadeByUserArray.push(key);
                    }
                  }
                // ------ CHANGES MADE ------ //


    // Calls the function and uses the users entered id and body params for the values to pass into function
    const userUpdated = await updateUser(userId, updatedUserFields);


    // If the User is updated once it will gain a property called modifiedCount if this is 1 its true
    if(userUpdated.modifiedCount == 1){
      // Success Message
      res.status(200).json({User_Updated: `User ${userId} updated`,
      // THIS is apart of the success message and it looks to see the length of the array of changes. IF array is 0? say message  'No changes made'
      Changes_Made_To: changesMadeByUserArray.length > 0 ? changesMadeByUserArray : 'No changes made'}); // Success Message
      debugUser(`User ${userId} Updated`);
    }
    else{
      // Error Message
      res.status(404).json({Error: `User ${userId} Not Found`});
      debugUser(`User ${userId} Not Found  \n`); // Message Appears in terminal
    }
  }
  catch (err) {
    res.status(500).json({Error: err.stack});
  }
});
// uuuuuuuuuuuuuuuuu UPDATE A USER uuuuuuuuuuuuuuuuu







// -------------------- DELETING USER FROM DATABASE -------------------
router.delete("/:userId", async (req, res) => {

  // gets the id from the users url
  const usersId = req.params.userId;


  try {
    // Uses the Users id and plugs it into the deleteUser function
      const deleteTheUser = await deleteUser(usersId);

      if(deleteTheUser.deletedCount == 1){
        // Success Message
        res.status(200).json({User_Deleted: `User ${usersId} Deleted`, usersId});
        debugUser(`User ${usersId} Deleted\n`, usersId); // Message Appears in terminal
      }
      else{
        // Error Message
        res.status(404).json({Error: `User ${usersId} Not Found`});
        debugUser(`User ${usersId} Not Found\n`); // Message Appears in terminal
      }
  }
  catch (err) {
    res.status(500).json({Error: err.stack});
  }

});
// -------------------- DELETING USER FROM DATABASE -------------------















export {router as UserRouter};

