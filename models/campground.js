const mongoose = require('mongoose');
const Review= require('./review');

const Schema = mongoose.Schema;




const opts={ toJSON: {virtuals: true}}; //By default mongoose does not include virtuals when you convert a document to JSON and since we are stringifying campgroundsinside our campgrounds/index.js 
                                        //to use it inside clustermap we want this virtual field properties.popUpMarkup to be included


const CampgroundSchema = new Schema({
    title: String,
    images:[
        {
            url: String,
            filename: String
        }
    ],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        },

        

    },
    price: Number,
    description: String,
    location: String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref:'Review'
        }
    ] 
   
},opts);
//the reason we use virtual is bcz we dont wanna save it to our database we are deriving it with what is already stored in database

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`;
});

CampgroundSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground',CampgroundSchema);