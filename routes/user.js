const {Router}=require('express')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const multer=require('multer')

const upload = multer({ dest: 'uploads/' });

const User=require('../models/user')



const router=Router()

router.post('/register',async(req,res)=>{
    let email=req.body.email
    const exsist=await User.findOne({email:email})
    if(exsist){
        return res.status(400).send({
            message:"email already exsited"
        })
       
    }else{
        let name=req.body.name
        let hashedpassword=await bcrypt.hash(req.body.password,10)
        
        const user=new User({
         name:name,
         email:email,
         password:hashedpassword
        })
        const result=await user.save()
        //JWT TOKEN
        
        const {_id} = await result.toJSON();
        const token = jwt.sign({_id:_id}, "secret");
       
        res.cookie("jwt",token,{
            httpOnly:true,
            maxAge:24*60*60*1000
        })
        // res.send({
        //     message:"success"
        //  })
       
        res.json({
         user:result
        })

    }


  
  
})
router.post('/login',async(req,res)=>{
   const user=await User.findOne({email:req.body.email})
   if(!user){
    return res.status(404).send({
        message:"user not found"
    })
   }
   if(!(await bcrypt.compare(req.body.password,user.password) )){
    return res.status(400).send({
        message:"password is incorrect"
    })
   }
   const token=jwt.sign({_id:user._id},"secret")
   res.cookie("jwt",token,{
    httpOnly:true,
    maxAge:24*60*60*1000
   })
   res.send({
    message:"success"
   })
})

router.get('/user',async(req,res)=>{
    try{
        const cookie=req.cookies['jwt']
        const claims=jwt.verify(cookie,"secret")
        console.log(claims);
       
        if(!claims){
            return res.status(404).send({
                message:"unauthenticated"
            })
        }
     
        const user=await User.findOne({_id:claims._id})
       
        const {password,...data}=await user.toJSON()
        res.send(data)
        
    }catch(err){

        return res.status(401).send({
            message:'unauthenticated'
        })
    }
})
router.post('/profile',upload.single('image'),async(req,res)=>{
    console.log("hiii");
    const cookie=req.cookies["jwt"]
    const claims=jwt.verify(cookie,"secret")
    if(!claims){
        return res.status(404).send({
            message:"unauthenticated"
        })

    }
    const imageadded=await User.updateOne({_id:claims._id},{$set:{image:req.file.filename}})
    if(imageadded){
        res.status(200).json({
            message : 'image uploaded successfully'
        })
    }else {
        res.status(401).json({
            message : 'Something went wrong'
        })
    }
})



router.post('/logout',(req,res)=>{
    res.cookie("jwt","",{maxAge:0})
    res.send({
        message:"success"
    })
})

module.exports=router;