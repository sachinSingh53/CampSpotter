const mongoose = require('mongoose');
const cities = require("./cities");
const Campground=require('../models/campground');
const {plces,descriptors, places} = require("./seedHelpers");
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    // useNewUrlParser: true,
    // // useCreateIndex:true,
    // useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random()*array.length)];
const seedDB = async ()=>{
    await Campground.deleteMany({});

    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: '650810f89c4799f664ceea42',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam alias saepe inventore quis eveniet nostrum neque totam, in sequi ipsum mollitia, vero at, libero ducimus nobis quaerat voluptas. Necessitatibus, laudantium!',
            price: price,
            geometry: { type: 'Point', coordinates: [ cities[random1000].longitude,cities[random1000].latitude] },
            images:[
                
                {
                url: 'https://res.cloudinary.com/dzp4ziyue/image/upload/v1695452065/YelpCamp/dv6t4htjkklcrnbdix0b.png',
                filename: 'YelpCamp/dv6t4htjkklcrnbdix0b',
                
                },
                {
                url: 'https://res.cloudinary.com/dzp4ziyue/image/upload/v1695452068/YelpCamp/sraapq53ugmqi1pei6ge.avif',
                filename: 'YelpCamp/sraapq53ugmqi1pei6ge',
                
                },
                {
                url: 'https://res.cloudinary.com/dzp4ziyue/image/upload/v1695452070/YelpCamp/orgwgeteijtaef35hrq2.jpg',
                filename: 'YelpCamp/orgwgeteijtaef35hrq2',
                
                }
                
            ]

        })

        await camp.save();
    }  
    
}

seedDB().then(()=>{
    mongoose.connection.close();
});