const mongoose = require('mongoose');
mongoose.Promise = global.Promise; //when querying the database, we'll wait for our data to come back with promises
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point' // a point on the map
    },
    coordinates: [{ //an array of numbers
      type: Number,
      required: 'You must provide the coordinates!'
    }],
    address: {
      type: String,
      required: 'You must provide the address!'
    }
  },
  photo: String
});

storeSchema.pre('save', async function(next) {
  if(!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running (exit)
  }
  this.slug = slug(this.name);
  // if we already have a store name in our database, we don't mind saving another one with the same name, but we will add a number extension to be able to differentiane between them
  const slugRegEx =  new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx}); // accessing Store before it even exists, it's created at the end of this file, but
  if(storesWithSlug.length) {  // if we have any matches
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;  //add dash and the next number
  }
  next();
})

storeSchema.statics.getTagsList = function() { // we need to use a proper function, because we need this (Store) to be able to use its methods; had we used arrow function usins this would not be possible
  return this.aggregate([
    { $unwind: '$tags' },  // a field on my doc that I wish to unwind, show all
    { $group: { _id: '$tags', count: { $sum: 1} }}, // group by specific id, and then sum all the instances of this tag
    { $sort: { count: -1 } } // sort by the most popular, count by ascending 1, or descending -1
  ]);
}

module.exports = mongoose.model('Store', storeSchema);
