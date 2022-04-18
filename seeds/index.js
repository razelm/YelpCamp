if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const axios = require("axios").default;

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
  console.log("Database connected!");
});

//Udemy comments solution
//Course had an outdated Unsplash API

// call unsplash and return small image
async function seedImg() {
  try {
    const resp = await axios.get("https://api.unsplash.com/photos/random", {
      params: {
        client_id: "PvV8sE2xz_J2rYGd_9zZ5k2l4CdzNcTmwEtnACShV_c",
        collections: 1114848,
      },
    });
    return resp.data.urls.small;
  } catch (err) {
    console.error(err);
  }
}

const seedDB = async() => {
    await Campground.deleteMany({}); // delete everything
 
    // Seed 50 new camps
    for(let i = 0; i < 200; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const placeSeed = Math.floor(Math.random() * places.length);
        const descriptorsSeed = Math.floor(Math.random() * descriptors.length);
        // const name = `${descriptors}, ${places}`;
        const price = Math.floor(Math.random() * 20) + 10;
        const location = `${cities[random1000].city}, ${cities[random1000].state}`
        const geoData = await geocoder.forwardGeocode({
            query: location,
            limit: 1
        }).send()
    // seed data into campground
    const camp = new Campground({
      author: "624053ec88da99693b174b28",
      images: [
        {
          url: "https://res.cloudinary.com/da4yaqn2e/image/upload/v1648926569/YelpCamp/1_mwakii.jpg",
          filename: "1_mwakii",
        },
        {
          url: "https://res.cloudinary.com/da4yaqn2e/image/upload/v1648926569/YelpCamp/2_jzjtyo.jpg",
          filename: "2_jzjtyo",
        },
      ],
      title: `${descriptors[descriptorsSeed]} ${places[placeSeed]}`,
      // title:name,
      // location: `${cities[citySeed].city}, ${cities[citySeed].state}`,
      location: location,
      geometry:{
          type:"Point",
          coordinates: [
            cities[random1000].longitude,
            cities[random1000].latitude,
        ]
      },
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda aliquam accusamus totam, aspernatur tempore magnam maxime voluptatum fugit amet molestias at provident sit molestiae perspiciatis iusto alias? Blanditiis, tempora! Vero!",
      price: price,
    });

    await camp.save();
  }
};

// const sample = (array) => array[Math.floor(Math.random() * array.length)];

// const seedDB = async() => {
//     await Campground.deleteMany({});
//     for(let i = 0;i < 10; i++ ){

        
//         const camp = new Campground({
//             location:`${cities[random1000].city}, ${cities[random1000].state}`,
//             title:`${sample(descriptors)} ${sample(places)}`,
//         });
//         await camp.save();
//     }
// }

seedDB().then(() => {
  mongoose.connection.close();
});


