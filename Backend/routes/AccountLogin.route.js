// Import required modules
import express from "express";
import { AccountLoginAdmin } from "../controller/AccountLoginAdmin.Controller.js";


const AccountAdminloginrouter = express.Router()

//CURD Functionality of Registertion

// Create the Data Register
AccountAdminloginrouter.post('/',AccountLoginAdmin);


export default AccountAdminloginrouter;