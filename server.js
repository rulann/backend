var http = require('http');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const ejs = require('ejs');

app.use(cors());
app.set('view engine', 'ejs');
app.set('views', 'views', 'profile');

const {MongoClient}=require('mongodb')

const connection="mongodb+srv://rulan:mongo123@cluster0.2fxosrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client= new MongoClient(connection)
const mydb= client.db('weather')  
const userCollection= mydb.collection('users')
const historyCollection= mydb.collection('history')
const forecastCollection= mydb.collection('forecast')

var bodyParse= require('body-parser')
var urlEncoded= bodyParse.urlencoded({extended:false})

const { ObjectId } = require('mongodb');
//const fetch = require('node-fetch');

// const url = 'https://weatherapi-com.p.rapidapi.com/current.json?q=53.1%2C-0.13';

const options = {
  method: 'GET',
  url: 'https://weatherapi-com.p.rapidapi.com/current.json',
  params: {q: 'jordan'},
  headers: {
    'X-RapidAPI-Key': '2a979c6d34mshebec9e618537967p1b3251jsn4644c6e971c7',
    'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
  }
};


app.get('/', function(req, res){
    res.send('start server')
})

app.get("/form", function(req,res)
{
   res.sendFile( __dirname + "/login.html") 
})

app.post('/login', urlEncoded, async(req, res)=>{
    const finduser= await userCollection.findOne({'username':req.body.username, 'password': req.body.password})
    if (finduser) 
        res.sendFile(__dirname+"/weather.html")
    else
        res.sendFile(__dirname+"/signup.html")
})

app.post('/signup', urlEncoded, async(req, res)=>{
    const userId = new ObjectId();

    const createuser= await userCollection.insertOne({
        '_id': userId,
        'username': req.body.username,
        'email': req.body.email,
        'password': req.body.password,
        'region': req.body.region
     })
     res.write('<script>alert("User added successfully, now you can log in");</script>');
     res.write('<script>window.location.href="/form";</script>');
     res.end();
})

app.get('/weather', async function(req, res){
    try {
        const country = req.query.country || 'jordan';
        const optionsWithParams = {
            method: 'GET',
            url: 'https://weatherapi-com.p.rapidapi.com/forecast.json',
            params: { q: country, days: 4 },
            headers: {
                'X-RapidAPI-Key': '2a979c6d34mshebec9e618537967p1b3251jsn4644c6e971c7',
                'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
            }  
        };

        const response = await axios.request(optionsWithParams);
        console.log(response.data);
        
     
        for (const day of response.data.forecast.forecastday) {
            await forecastCollection.insertOne({
                'country': response.data.location.country,
                'day': day.date,
                'Max_Temp': day.day.maxtemp_c,
                'Min_Temp': day.day.mintemp_c,
                'Condition': day.day.condition.text,
                'feels_like': day.day.condition.feelslike_c,
            });
        }
        // Send the response as JSON
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



app.get('/profile/:userId', async function(req, res) {
    const userId = req.params.userId;
  
    const user = await userCollection.findOne({ '_id': new ObjectId(userId) });
  
    if (user) {
      res.render('profile', { user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
  

app.get('/history', function(req, res){
    
})


var server= app.listen(9090, function()
{
    var host = server.address().address
    var port= server.address().port
})