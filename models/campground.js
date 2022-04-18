const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;



const ImageSchema = new Schema({
   
      url: String,
      filename: String,
    
});

ImageSchema.virtual('thumbnail').get(function(){
  return this.url.replace('/upload', '/upload/w_250')
})

const opts = { toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({
  geometry: {
    type: {
      type:String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  // geometry: {
  //   type: "Point",
  //   coordinates: [
  //     cities[random1000].longitude,
  //     cities[random1000].latitude,
  //   ]
  // },
  title: String,
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
  reviewTitle: [
    //Added this afterwards
    {
      type: Schema.Types.ObjectId,
      ref: "ReviewTitle",
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
}, opts);



CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
  // return `<a href="/campgrounds/${this._id}">${this.title}</a>`
  // <img class="card-img-top" src="${this.images[0]}" alt="Card image cap"></img>
  return `<div class="card" style="width: 12rem;">
  <div class="card-body">
    <a href="/campgrounds/${this._id}"><h5 class="card-title">${this.title}</h5></a>
    <p class="card-text">${this.description.substring(0,100)}...</p>
    <a href="/campgrounds/${this._id}" class="btn btn-sm btn-warning">Go here!</a>
  </div>
</div>`
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("campground", CampgroundSchema);

// My ID = 624053ec88da99693b174b28
