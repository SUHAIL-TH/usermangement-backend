const  {Router}=require('express')
const jwt=require('jsonwebtoken')
const Admin=require('../models/admin');
const users=require("../models/user");
const bcrypt=require('bcrypt')


const router=Router();




router.post('/login',async(req,res)=>{
   console.log(req.body.email);
    let admindata=await Admin.findOne({email:req.body.email})
    console.log(admindata);
    if(!admindata){
        return res.status(400).send({
            message:"user not found"
        })
    }
     if(admindata.password!=Number(req.body.password)){
        return res.status(400).send({
            message:"Invalid Email or password"
        })
    }

    const token=jwt.sign({_id:admindata._id},"secretadmin")
    res.cookie("jwt",token,{
        httpOnly:true,
        maxAge:24*60*60*1000
    })
    res.send({
        message : 'Success'
    })
})


router.get('/users',async(req,res)=>{
    let userData= await users.find()
    res.status(200).json(userData)
})
router.get('/deleteuser',async(req,res)=>{
    let id=req.query.id
    await users.findByIdAndDelete(id)
    res.send(
        {message:"success"}
    )
})
router.get('/editDetails',async(req,res)=>{
    let id=req.query.id
    let data=await users.findOne({_id:id})
    res.status(200).json(data)
})
router.post('/edituser',async(req,res)=>{
    let email=req.body.email
    let name=req.body.name
    let id=req.body.id
    await users.findByIdAndUpdate(id,{name:name,email:email})
    res.send({
        message : 'Success'
    })

})
router.post('/createuser',async(req,res)=>{
    let email=req.body.email
    let password=await bcrypt.hash(req.body.password,10)
    let name=req.body.name

    const user=new users({
        name:name,
        email:email,
        password:password
    })
    await user.save()
    res.send({
        message:"user addes successfully"
    })


})

router.post('/logout',(req,res)=>{
    console.log("logout admin");
    res.cookie("jwt","",{maxAge:0}),
    res.send("success")
})
module.exports=router;