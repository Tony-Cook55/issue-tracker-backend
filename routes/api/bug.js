
import express from "express";

const router = express.Router();


import debug from "debug";
const debugBug = debug("app:BugRouter");

router.use(express.urlencoded({extended:false}));


const bugsArray = [];


router.get("/list", (req, res) => {
  debugBug("Bug List Route Hit");
  res.json(bugsArray);
});


router.get("/:bugId", (req, res) => {
  const bugId = req.params.bugId;
  //FIXME: GET BUG FROM BUGS ARRAY AND SEND RESPONSE AS JSON
});


router.post("/new", (req, res) => {
  //FIXME:CREATE NEW BUG AND SEND RESPONSE AS JSON
});


router.put("/:bugId", (req, res) => {
  //FIXME: UPDATE EXISTING BUGS AND SEND RESPONSE AS JSON
});


router.put(":bugId/classify", (req,res) => {
//FIXME: CLASSIFY BUG AND SEND RESPONSE AS JSON
});


router.put(":bugId/assign", (req,res) => {
  //FIXME: ASSIGN BUG TO A USER AND SEND RESPONSE AS JSON
});


router.put(":bugId/close", (req,res) => {
  //FIXME: CLOSE BUG AND SEND RESPONSE AS JSON
});


export {router as BugRouter};






