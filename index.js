const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs')
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()

app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.skbfv9j.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
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