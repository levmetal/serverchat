const express =require('express');
const router = express.Router();

router.get('/', (req,res)=>{
  res.send('is working on');
})

module.exports= router;
