//缓存-access_token与jsapi_ticket到数据库中

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ticketSchema = new Schema({
  access_token: String,
  token_time: String,
  jsapi_ticket: String,
  ticket_time: String
});

module.exports = mongoose.model('ticket', ticketSchema);