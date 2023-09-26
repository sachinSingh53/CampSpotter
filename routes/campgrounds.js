const express = require('express');
const router = express.Router();
const {campgroundSchema}=require('../schemas');
const catchAsync=require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground=require('../models/campground');
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware');
const multer  = require('multer');
const storage = require('../cloudnary/index');
const upload = multer( storage );

const {cloudinary} = require('../cloudnary/index');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");


const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:mapboxToken});






router.get('/',catchAsync(async(req,res)=>{
    const campgrounds= await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}))

router.get('/new',isLoggedIn,(req,res)=>{
    res.render('campgrounds/new');
})

router.post('/', upload.array('image'), validateCampground, catchAsync(async(req,res,next)=>{
    if(!req.body.campground) throw new ExpressError("Invalid Campground Data",400);

   const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    // console.log(geoData.body.features[0].geometry);
   
    const campground = new Campground(req.body.campground);  
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f=>({url: f.path, filename: f.filename}));
    
    campground.author = req.user._id;
    

    await campground.save();
    // console.log(campground);
    req.flash('success','Successfully made a new campground');
    res.redirect(`campgrounds/${campground._id}`);



    
    
    
}))



router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async(req,res) =>{
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error','Campground Not Found!!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}))

router.put('/:id',isLoggedIn,isAuthor, upload.array('image'),validateCampground,catchAsync(async(req,res)=>{
    const { id } = req.params;
    // console.log(req.body);

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground})
    const imgs = req.files.map(f=>({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);

    campground.geometry = geoData.body.features[0].geometry;

    

    if(req.body.deleteImage){
        for (let filename of req.body.deleteImage) {
           await cloudinary.uploader.destroy (filename);
        }
       await campground.updateOne({$pull:{images:{filename:{$in: req.body.deleteImage}}}});
    }

    await campground.save(); 

    

    req.flash('success','Campground Updated Successfully')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id',isAuthor,catchAsync(async (req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Deleted Campground successfully');
    res.redirect('/campgrounds');
    // res.render("HO");
}))

router.get('/:id',catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    // console.log(campground);
    if(!campground){
        req.flash('error','Campground Not Found!!');
        res.redirect('/campgrounds');
    }
    // console.log(campground);
    res.render("campgrounds/show",{campground});
}))

 


module.exports = router;