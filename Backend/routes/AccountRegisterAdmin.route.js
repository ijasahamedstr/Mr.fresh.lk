// Import required modules
import express from "express";
import { AccountCreatAdmin, AccountDelete, AccountIndex, AccountSingleDetails, AccountUpdateAdmin } from "../controller/AccountRegisterAdmin.Controller.js";


const AccountAdminrouter = express.Router()

//CURD Functionality of Registertion

// Create the Data Register
AccountAdminrouter.post('/',AccountCreatAdmin);

// View the Data Register
AccountAdminrouter.get('/',AccountIndex);

// View the Single Data Register
AccountAdminrouter.get("/:id",AccountSingleDetails);

//Delete Data Register
AccountAdminrouter.delete('/:id',AccountDelete);

//Update Data Register
AccountAdminrouter.put('/:id',AccountUpdateAdmin);


export default AccountAdminrouter;