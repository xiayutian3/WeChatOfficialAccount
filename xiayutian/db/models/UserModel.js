var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  user:  String,
  pwd: String,
});

module.exports = mongoose.model('user', userSchema);