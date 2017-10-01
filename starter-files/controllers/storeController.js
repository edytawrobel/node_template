const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');  //resize our photos
const uuid =  require('uuid'); // make file names unique, unique identifier

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true); // it's fine, continue uploading; a callback Promise if you call next and pass it sth as the 1st value, that means it's an error; when you pass it null and a 2 value, that means it worked, and the second value you're passing is what needs to get passed
    } else {
      next({ message: 'That file type is not allowed'}, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
};

// exports.myInfo = (req, res) => {
//   const ed = { name: 'Edyta', surname: 'Wrobel', age: '100'}
//   res.json(ed);
// };
//
// exports.reverseInfo = (req, res) => {
//   const reverse = [...req.params.name].reverse().join('');
//   res.send(reverse);
// };

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add Store'});
};

exports.upload = multer(multerOptions).single('photo'); // it doesn't save the file to disk, but just stores it in memory of your server temporarily

exports.resize = async (req, res, next) => { // we pass it next because it is a middleware, we're not going to be doing any rendering or sending back to the client, we'll just save the image,
  if(!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1]; // what is the type of the image
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`/public/uploads/${req.body.photo}`);
  next();
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save(); // returns a promise, we won't move on to the next line until save has happened
  req.flash('success',  `Successfully created ${store.name} Care to leave a review?`)
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();   // query database for a list of all stores
  res.render('stores', { title: 'Stores', stores }) // pass the variable to the template view (it would be usually stores: stores, but es6 you dont need to repeat)
};

exports.editStore = async (req, res) => {
  // find store given the id
  const store = await Store.findOne({ _id: req.params.id }) // all the queries to the database return a promise
  // res.json(store);
  //confirm they're the owner of the store
  //render out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store });
}

exports.updateStore = async (req, res) => {
  //when updating the deaults do not kick in, so you need to set them manually
  req.body.location.type = 'Point';
  //find and update the store
  const store = await Store.findOneAndUpdate( { _id: req.params.id }, req.body, { new: true, runValidators: true }).exec();
  req.flash('success', `Successfully updated <strong> ${store.name} </strong>. <a href="stores/${store.slug}">View store</a>`);
  res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if(!store) return next();
  res.render('store', { store, title: store.name });
}

exports.getStoresByTag = async (req, res) => {
  const tags = await Store.getTagsList();
  res.render('tag', { tags, title: 'Tags' });
}
