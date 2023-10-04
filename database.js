
// I I I I I I I    IMPORTS   I I I I I I I
import * as dotenv from 'dotenv';
dotenv.config();


import { MongoClient, ObjectId } from "mongodb";
import debug from 'debug';
const debugDatabase = debug('app:Database');

// I I I I I I I    IMPORTS   I I I I I I I


/** Generate/Parse an ObjectId */
const newId = (str) => new ObjectId(str);



/** Global variable storing the open connection, do not use it directly. */
let _db = null;



/** Connect to the database */
async function connect(){
  if (!_db) {
    const connectionString = process.env.DB_URL;
    const dbName = process.env.DB_NAME;
    const client = await MongoClient.connect(connectionString);
    _db = client.db(dbName);
    debugDatabase('Connected.');
  }
  return _db;
}



/** Connect to the database and verify the connection */
async function ping() {
  const db = await connect();
  await db.command({ ping: 1 });
  debugDatabase("Pinged your deployment. You successfully connected to MongoDB!\n");
}




// ******************************* USERS ********************************** //


// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ //
async function getAllUsers(){
  // Calling the connect from above method to get the DB
  const dbConnected = await connect();

  // "User" == the collection name in our database
  const allUsers = await dbConnected.collection("User").find().toArray();

  //Returns All Users to postman
  return allUsers;
}
// ~~~~~~~~~~~~~~~~ FIND ALL USERS ~~~~~~~~~~~~~~~~ //



// !!!!!!!!!!!!!!! SEARCHING FOR A USER BY ID !!!!!!!!!!!!!!! //
async function getUserById(usersId){
  const dbConnected = await connect();
                                       // Uses this call in:  import { ObjectId } from "mongodb";
  const findUserById = await dbConnected.collection("User").findOne({_id: new ObjectId(usersId)});

  return findUserById;
}
// !!!!!!!!!!!!!!! SEARCHING FOR A USER BY ID !!!!!!!!!!!!!!! //





// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ //
async function addNewUser(newUser){
  const dbConnected = await connect();


  // Here we create a new item in the database called usersCreationDate and we set the time it was made at for its value
  //newUser.usersCreationDate = new Date().toDateString();
  newUser.usersCreationDate = new Date().toLocaleString('en-US');


  const addingNewUser = await dbConnected.collection("User").insertOne(newUser);


  return addingNewUser;
}
// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ //





// LLLLLLLLLLLLLLLLLLL USERS LOGIN LLLLLLLLLLLLLLLLLLL //
async function loginUser(userLogin){

  const dbConnected = await connect();

  // Finding a user based on their email entered
  const userLoggedIn = await dbConnected.collection("User").findOne({email: userLogin.email});

  // It will either find or not find the user based on the inputs
  return userLoggedIn;

}
// LLLLLLLLLLLLLLLLLLL USERS LOGIN LLLLLLLLLLLLLLLLLLL //





// uuuuuuuuuuuuuuuuu UPDATE A USER uuuuuuuuuuuuuuuuu //
async function updateUser(usersId, updatedUserFields){

  const dbConnected = await connect();


  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  updatedUserFields.lastUpdated = new Date().toLocaleString('en-US');


  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const userUpdated = await dbConnected.collection("User").updateOne({_id: new ObjectId(usersId)},{$set:{...updatedUserFields}});

  return userUpdated;
}
// uuuuuuuuuuuuuuuuu UPDATE A USER uuuuuuuuuuuuuuuuu //





// ------------------ DELETE USER BY ID ------------------ //
async function deleteUser(usersId){

  const dbConnected = await connect();

  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const deleteTheUser = await dbConnected.collection("User").deleteOne({_id: new ObjectId(usersId)});

  return deleteTheUser;
}
// ------------------ DELETE USER BY ID ------------------ //



  // ******** USERS EXPORTS ******** //
export{
  getAllUsers,
  getUserById,
  addNewUser,
  loginUser,
  updateUser,
  deleteUser
};
  // ******** USERS EXPORTS ******** //



// ******************************* USERS ********************************** //




















// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! BUGS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

// ~~~~~~~~~~~~~~~~ FIND ALL BUGS ~~~~~~~~~~~~~~~~ //
async function getAllBugs(){
  // Calling the connect from above method to get the DB
  const dbConnected = await connect();

  // "User" == the collection name in our database
  const allBugs = await dbConnected.collection("Bug").find().toArray();

  //Returns All Bugs to postman
  return allBugs;
}
// ~~~~~~~~~~~~~~~~ FIND ALL BUGS ~~~~~~~~~~~~~~~~ //




// !!!!!!!!!!!!!!! SEARCHING FOR A BUG BY ID !!!!!!!!!!!!!!! //
async function getBugById(bugsId){
  const dbConnected = await connect();
                                       // Uses this call in:  import { ObjectId } from "mongodb";
  const findBugById = await dbConnected.collection("Bug").findOne({_id: new ObjectId(bugsId)});

  return findBugById;
}
// !!!!!!!!!!!!!!! SEARCHING FOR A BUG BY ID !!!!!!!!!!!!!!! //



// +++++++++++++++++ ADDING A NEW BUG +++++++++++++++++ //
async function addNewBug(newBug){
  const dbConnected = await connect();


  // Here we create a new item in the database called usersCreationDate and we set the time it was made at for its value
  //newUser.usersCreationDate = new Date().toDateString();
  newBug.usersCreationDate = new Date().toLocaleString('en-US');


  const addingNewBug = await dbConnected.collection("Bug").insertOne(newBug);


  return addingNewBug;
}
// +++++++++++++++++ ADDING A NEW BUG +++++++++++++++++ //



// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu //
async function updateBug(bugsId, updateBugFields){

  const dbConnected = await connect();


  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  updateBugFields.lastUpdated = new Date().toLocaleString('en-US');


  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bugUpdated = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...updateBugFields}});

  return bugUpdated;
}
// uuuuuuuuuuuuuuuuu UPDATE A BUG uuuuuuuuuuuuuuuuu //




// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc // approved, unapproved, duplicate, by default unclassified
async function updateClassification(bugsId, classifyBugFields){

  const dbConnected = await connect();


  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  classifyBugFields.lastUpdated = new Date().toLocaleString('en-US');

  //This will create a new item called classifiedOn which sets the current date its classified on
  classifyBugFields.classifiedOn = new Date().toLocaleString('en-US');

  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bugClassificationUpdated = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...classifyBugFields}});

  return bugClassificationUpdated;
}
// ccccccccccccccccc CLASSIFY A BUG ccccccccccccccccc //




// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa
async function assignBugToUser(bugsId, assignedBugFields){

  const dbConnected = await connect();

  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  assignedBugFields.lastUpdated = new Date().toLocaleString('en-US');

  //This will create a new item called assignedOn which sets the current date its classified on
  assignedBugFields.assignedOn = new Date().toLocaleString('en-US');


  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bugAssigned = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...assignedBugFields}});

  return bugAssigned;
}
// aaaaaaaaaaaaaaaaaa ASSIGN A BUG aaaaaaaaaaaaaaaaaa //





// xxxxxxxxxxxxxx CLOSING A BUG xxxxxxxxxxxxxx
async function closeBug(bugsId, closedFields){

  const dbConnected = await connect();

  // Here we create a new item in the Database called lastUpdated and we set the time it was made at for its value
  closedFields.lastUpdated = new Date().toLocaleString('en-US');

  //This will create a new item called assignedOn which sets the current date its classified on
  closedFields.closedOn = new Date().toLocaleString('en-US');


  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const bugClosed = await dbConnected.collection("Bug").updateOne({_id: new ObjectId(bugsId)},{$set:{...closedFields}});

  return bugClosed;
}
// xxxxxxxxxxxxxx CLOSING A BUG xxxxxxxxxxxxxx //






  // !!!!!! BUGS EXPORTS !!!!!!!! //
export{
  getAllBugs,
  getBugById,
  addNewBug,
  updateBug,
  updateClassification,
  assignBugToUser,
  closeBug
};

  // !!!!!! BUGS EXPORTS !!!!!!!! //

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! BUGS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //






// export functions
export {
  newId,
  connect,
  ping
};

// test the database connection
ping();