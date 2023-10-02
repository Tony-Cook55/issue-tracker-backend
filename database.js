
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

  // Mongo Shell Command to find all the book: db.books.find()
  // "User" == the collection name in our database
  const allUsers = await dbConnected.collection("User").find().toArray();

  //Returns Books to postman
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
  newUser.usersCreationDate = new Date().toDateString();


  const addingNewUser = await dbConnected.collection("User").insertOne(newUser);


  return addingNewUser;
}


async function emailAlreadyExistsCheck(usersEmailInput){

  const dbConnected = await connect();

  const emailAlreadyExists = await dbConnected.collection("User").findOne({email: usersEmailInput.email});

  return emailAlreadyExists;
}


// +++++++++++++++++ ADDING A NEW USER +++++++++++++++++ //
















// ------------------ DELETE USER BY ID ------------------ //
async function deleteUser(usersId){

  const dbConnected = await connect();

  // gets the inputted id and the input for all the fields due to the:  ... gets all the values from the fields
  const deleteTheUser = await dbConnected.collection("User").deleteOne({_id: new ObjectId(usersId)});

  return deleteTheUser;
}
// ------------------ DELETE USER BY ID ------------------ //

// ******************************* USERS ********************************** //









// export functions
export {
  newId,
  connect,
  ping,


  // ******** USERS EXPORTS ******* //
  getAllUsers,
  getUserById,
  addNewUser,

  emailAlreadyExistsCheck,



  deleteUser

  // ******** USERS EXPORTS ******* //
};

// test the database connection
ping();