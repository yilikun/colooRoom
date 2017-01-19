/**
 * Created by june on 2017/1/5.
 */
var mongoose = require('mongoose');
var settings = require('./db/settings.js');
var db = mongoose.connect(settings.URL);