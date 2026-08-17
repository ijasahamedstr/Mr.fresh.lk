import express from 'express';
import { createAdmin, deleteAdmin, getAllAdmins, login, manualUnlock, setup2FA, updateAdmin, verify2FA } from '../controller/AccountRegisterAdmin.Controller.js';

const Adminrouter = express.Router();

Adminrouter.post('/create',createAdmin);

Adminrouter.post('/setup-2fa',setup2FA);

Adminrouter.post('/verify-2fa',verify2FA);

Adminrouter.get('/all',getAllAdmins);

Adminrouter.post('/login',login);

Adminrouter.put('/edit/:id', updateAdmin); // Uses ID from URL

Adminrouter.delete('/delete/:id',deleteAdmin); // Uses ID from URL

// New Unlock Route
Adminrouter.patch('/unlock/:id', manualUnlock);

export default Adminrouter;