import express from 'express';
import { Slidercreate, SliderDelete, SliderIndex, SliderSingleDetails, Sliderupdate } from '../controller/Slidersection.Controller.js';

// Create a new router instance
const Slidersection = express.Router();


// Create the Data Register
Slidersection.post('/',Slidercreate);

// View the Data Register
Slidersection.get('/',SliderIndex);

// View the Single Data Register
Slidersection.get("/:id",SliderSingleDetails);

//Delete Data Register
Slidersection.delete('/:id',SliderDelete);

//Update Data Register
Slidersection.put('/:id',Sliderupdate);


export default Slidersection;
