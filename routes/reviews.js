const express = require('express');
const router = express.Router({mergeParams:true});

const catchAsync=require('../utils/catchAsync');
const Review = require('../models/review');
const Campground=require('../models/campground');
const {reviewSchema}=require('../schemas')
const campgrounds = require('../routes/campgrounds');
const ExpressError = require('../utils/ExpressError');
const {isLoggedIn} = require('../middleware');

// const validateReview = (req,res,next)=>{
//     const{error} = reviewSchema.validate(req.body);
//     if(error){
//         const msg = error.details.map(el=>el.message).join(',')
//         throw new ExpressError(msg,400)
//     }else{
//         next()
//     }
// }


router.post('/',isLoggedIn,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Review added successfully')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId',async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Deleted review successfully');

    res.redirect(`/campgrounds/${id}`);
})

module.exports = router;
