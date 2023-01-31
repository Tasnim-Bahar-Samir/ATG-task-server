const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()

app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.skbfv9j.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const userCollection = client.db('dbUser3').collection('users')
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object

//   console.log('db connected')
//   client.close();
// });

async function run(){
    try{
        app.post("/users", async (req, res) => {

            const {name,email,password,phone} = req.body;
            const ancryptedPassword = await bcrypt.hash(password,10)
            const query = {email}
            const alreadyAddedUser = await userCollection.find(query).toArray();
            if(alreadyAddedUser.length){
              return res.send({success:false, message:"This user is already exist"})
            }
            const user = {
              name,
              email,
              password: ancryptedPassword,
              phone,
            }
            const result = await userCollection.insertOne(user);
      
            if (result.insertedId) {
              res.send({
                success: true,
                message: "User registered successfully",
              });
            } else {
              res.send({
                success: false,
                message: "Failed to register",
              });
            }
          });

          app.post('/login', async(req,res)=>{
            const {email,password} = req.body;
            const user = await userCollection.findOne({email})
            console.log(user)
            if(!user){
              return res.send({success: false, message:"No user found.Please register first."})
            }
            if(await bcrypt.compare(password, user.password)){
              const token = jwt.sign({email},process.env.JWT_SECRETEKEY)
              if(res.status(201)){
              return  res.send({ success:true, data: token})
              }else{
                return res.send({ success:false, message:'Failed to generate token'})
               }
            }
            res.send({message:"Invalid Password"})
          })

          app.get('/user', async(req,res)=>{
            const token = req.headers.authorization;
            const user = jwt.verify(token, process.env.JWT_SECRETEKEY)
            const query = {email: user.email}
            const result = await userCollection.findOne(query);
            if(result){
              res.send({success: true,data: result})
            }
          })
          
    }
    catch(err){
        console.log(err.name,err.message)
    }
}

run()

app.get('/',(req,res)=>{
    res.send('Server is running')
})

app.listen(port,()=>{
    console.log('Backend server is running on port', port)
})