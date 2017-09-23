const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  res.render('index');
};

exports.myInfo = (req, res) => {
  const ed = { name: 'Edyta', surname: 'Wrobel', age: '100'}
  res.json(ed);
};

exports.reverseInfo = (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
};

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add Store'});
};

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  // store
  //   .save()
  //   .then(store => {
  //     res.json(store);
  //   })
  //   .catch(err => {
  //     throw Error(err);
  //   })
  // res.json(req.body);
  // await store.save();  returns a promise, we won't move on to line 26 until save has happened
  req.flash('success',  `Successfully created ${store.name} Care to leave a review?`)
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();   // query database for a list of all stores
  res.render('stores', { title: 'Stores', stores }) // pass the variable to the template view (it would be usually stores: stores, but es6 you dont need to repeat)
};
