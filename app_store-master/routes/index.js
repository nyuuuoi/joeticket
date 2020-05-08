var express = require('express');
var moment = require('moment');
var router = express.Router();

// aws setup
const AWS = require('aws-sdk');

// Mongodb setup
var ObjectID = require('mongodb').ObjectID
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// Connection URL
const url = 'mongodb://zoeTicket:Z7FtzBxOI5RhwIpZopcr@docdb-2019-10-16-01-23-09.cluster-c5agz8g2jym0.us-east-2.docdb.amazonaws.com:27017'; 
// Create a new MongoClient
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true  });
// Use connect method to connect to the Server
client.connect(function(err){
    assert.equal(null, err);
    console.log("Connected successfully to server");
})

// mySQL setup
const mysql = require('mysql');
var coninfo = {
  host: 'flightsbooking.cluster-c5tokmxj9jbb.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'Z7FtzBxOI5RhwIpZopcr',
  database: 'flights',
  debug: false,
}
var con = mysql.createConnection(coninfo)

function init() {
  // DB connection의 불특정 error handler 
  con.on('error', function (err) {
    console.log('DB Connection Error:');
    console.log(err);
    // conection lot ?
    if (err && (err.code === 'PROTOCOL_CONNECTION_LOST')) {
      con = mysql.createConnection(coninfo);
      return;
    }
  });
}
init();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

/* GET result page. */
router.get('/result', function(req, res) {
    var tripstart = req.query.tripstart;
    var tripend = req.query.tripend;
    var tripdate = req.query.tripdate.substring(0,10);  
    // MongoDB Setup
    var db = client.db('testdb');
    // MongoDB Sort & Filter
    var sort_name = {"offerItems.0.price.total" : 1};
    var find_name = {$and:[{$or:[{$and:[{"offerItems.0.services.0.segments.0.flightSegment.departure.iataCode" : tripstart},
        {"offerItems.0.services.0.segments.0.flightSegment.arrival.iataCode" : tripend},
        {"offerItems.0.services.0.segments.1" : { $exists: false }}]}, 
        {$and:[{"offerItems.0.services.0.segments.0.flightSegment.departure.iataCode" : tripstart},
        {"offerItems.0.services.0.segments.1.flightSegment.arrival.iataCode" : tripend}]},                 // One Stops
        {$and:[{"offerItems.0.services.0.segments.0.flightSegment.departure.iataCode" : tripstart},
        {"offerItems.0.services.0.segments.2.flightSegment.arrival.iataCode" : tripend}]},                 // Two Stops
        {$and:[{"offerItems.0.services.0.segments.0.flightSegment.departure.iataCode" : tripstart},
        {"offerItems.0.services.0.segments.3.flightSegment.arrival.iataCode" : tripend}]}],                // Three Stops
        "offerItems.0.services.0.segments.0.flightSegment.departure.at" : {$regex: ".*" + tripdate + ".*"}}],
    }

    // Get database for render
    db.collection('flightsData').find(find_name).sort(sort_name).toArray((err, res_lowPrices) => {
        if (err) return console.log(err)   
        db.collection('dict').find().toArray((err, dict) => {
        if (err) return console.log(err)       
            res.render('result', { dbs: res_lowPrices, moment: moment, dict: dict })
        }); 
    });      
});


/* GET result page. */
router.get('/result2', function (req, res) {
    var tripstart = req.query.tripstart;
    var tripend = req.query.tripend;
    var tripdate1 = req.query.tripdate.substring(0, 10);
    var tripdate2 = req.query.tripdate.substring(14, 24);

    // MongoDB Setup
    var db = client.db('testdb');
    // MongoDB Sort & Filter
    var sort_name = { "offerItems.0.price.total": 1 };
    var find_name = {
        $and: [{ "offerItems.0.services.1": { $exists: true } }, {
        $and: [{
            $or: [{
            $and: [{ "offerItems.0.services.0.segments.0.flightSegment.departure.iataCode": tripstart },
            { "offerItems.0.services.0.segments.0.flightSegment.arrival.iataCode": tripend },
            { "offerItems.0.services.0.segments.1": { $exists: false } }]
            },
            {
            $and: [{ "offerItems.0.services.0.segments.0.flightSegment.departure.iataCode": tripstart },
            { "offerItems.0.services.0.segments.1.flightSegment.arrival.iataCode": tripend }]
            },                 // One Stops
            {
            $and: [{ "offerItems.0.services.0.segments.0.flightSegment.departure.iataCode": tripstart },
            { "offerItems.0.services.0.segments.2.flightSegment.arrival.iataCode": tripend }]
            },                 // Two Stops
            {
            $and: [{ "offerItems.0.services.0.segments.0.flightSegment.departure.iataCode": tripstart },
            { "offerItems.0.services.0.segments.3.flightSegment.arrival.iataCode": tripend }]
            }],                // Three Stops
            "offerItems.0.services.0.segments.0.flightSegment.departure.at": { $regex: ".*" + tripdate1 + ".*" }
        }],
        }, {
        $and: [{
            $or: [{
            $and: [{ "offerItems.0.services.1.segments.0.flightSegment.departure.iataCode": tripend },
            { "offerItems.0.services.1.segments.0.flightSegment.arrival.iataCode": tripstart },
            { "offerItems.0.services.1.segments.1": { $exists: false } }]
            },
            {
            $and: [{ "offerItems.0.services.1.segments.0.flightSegment.departure.iataCode": tripend },
            { "offerItems.0.services.1.segments.1.flightSegment.arrival.iataCode": tripstart }]
            },                 // One Stops
            {
            $and: [{ "offerItems.0.services.1.segments.0.flightSegment.departure.iataCode": tripend },
            { "offerItems.0.services.1.segments.2.flightSegment.arrival.iataCode": tripstart }]
            },                 // Two Stops
            {
            $and: [{ "offerItems.0.services.1.segments.0.flightSegment.departure.iataCode": tripend },
            { "offerItems.0.services.1.segments.3.flightSegment.arrival.iataCode": tripstart }]
            }],                // Three Stops
            "offerItems.0.services.1.segments.0.flightSegment.departure.at": { $regex: ".*" + tripdate2 + ".*" }
        }],
        }]
    }

    // Get database for render
    db.collection('flightsViaData').find(find_name).sort(sort_name).toArray((err, res_lowPrices) => {
        if (err) return console.log(err)
        db.collection('dict').find().toArray((err, dict) => {
        if (err) return console.log(err)
            res.render('result2', { dbs: res_lowPrices, moment: moment, dict: dict })
        });
    });
});

/* GET book page. */
router.get('/book', function(req,res){
    var flightsId = req.query.flightsId;
    var checkReturn = req.query.checkReturn;

    // MongoDB Setup
    var db = client.db('testdb');
    var find_name = {"id" : flightsId}    
    if (checkReturn=="oneway"){
      db.collection('flightsData').findOne(find_name, (err, bookInfo) => {
        if (err) return console.log(err)
        // Get database for render   
        res.render('book', {info : bookInfo, checkReturn : checkReturn})
      });
    } else {
      db.collection('flightsViaData').findOne(find_name, (err, bookInfo) => {
        if (err) return console.log(err)
        // Get database for render 
        res.render('book', {info : bookInfo, checkReturn : checkReturn})
      });
    }
});


/* POST book page. */
router.post('/book', function(req,res){
    var sql = 'INSERT INTO book SET ?';
    var user = {
        id : Math.floor(Math.random() * (999999999999 - 100000000000)) + 100000000000,
        lastname : req.body.lastname,
        firstname : req.body.firstname,
        gender : req.body.gender,
        birth : req.body.birth,
        nationality : req.body.nationality,
        email : req.body.email,
        phonecode : req.body.phonecode,
        phone : req.body.phone,
        flightsId : req.body.flightsId,
    }
    // Check whether oneway or return
    var checkReturn = req.body.checkReturn
    // If mysql is not connected
    if(!con._connectCalled){
        con.connect(function(err){
            if (err) {
                console.log('DB Connection Error:');
                console.log(err);
            }     
            con.query(sql, user, function (err) {
                if (err) {
                    console.log('DB Select Error:');
                    console.log(err);
                }  
                var db = client.db('testdb');
                var find_name = {"id" : user.flightsId}          
                // Oneway & mysql not connected
                if (checkReturn=="oneway"){
                    db.collection('flightsData').findOne(find_name, (err, bookCopy) => {
                        if (err) {
                            console.log('DB Select Error:');
                            console.log(err);
                        }        
                        bookCopy._id = new ObjectID()
                        bookCopy.userId = user.id
                        documentlength = bookCopy.offerItems[0].services[0].segments.length
                        departure = bookCopy.offerItems[0].services[0].segments[0].flightSegment.departure.iataCode
                        arrival = bookCopy.offerItems[0].services[0].segments[documentlength - 1].flightSegment.arrival.iataCode
                        price = bookCopy.offerItems[0].price.total + bookCopy.offerItems[0].price.totalTaxes
                        depdate = bookCopy.offerItems[0].services[0].segments[0].flightSegment.departure.at.substring(0, 10)
                        db.collection("bookData").insertOne(bookCopy, (err) => {
                            if (err) {
                                console.log('DB Select Error:');
                                console.log(err);
                            }  
                            res.render('test', { price: price, rese: bookCopy.userId, user: user, departure: departure, arrival: arrival, AWS: AWS, depdate: depdate })
                        });
                    });
                } else {
                    // Return & mysql not connected
                    db.collection('flightsViaData').findOne(find_name, (err, bookCopy) => {
                        if (err) {
                            console.log('DB Select Error:');
                            console.log(err);
                        }       
                        bookCopy._id = new ObjectID()
                        bookCopy.userId = user.id
                        documentlength = bookCopy.offerItems[0].services[0].segments.length
                        departure = bookCopy.offerItems[0].services[0].segments[0].flightSegment.departure.iataCode
                        arrival = bookCopy.offerItems[0].services[0].segments[documentlength - 1].flightSegment.arrival.iataCode
                        price = bookCopy.offerItems[0].price.total + bookCopy.offerItems[0].price.totalTaxes
                        depdate = bookCopy.offerItems[0].services[0].segments[0].flightSegment.departure.at.substring(0, 10)
                        db.collection("bookData").insertOne(bookCopy, (err) => {
                            if (err) {
                                console.log('DB Select Error:');
                                console.log(err);
                            }  
                            res.render('test', { price: price, rese: bookCopy.userId, user: user, departure: departure, arrival: arrival, AWS: AWS, depdate: depdate })
                        })
                    })
                }
            });
        });
    } else {
        // If mysql is connected
        con.query(sql, user, function (err) {
            if (err) {
                console.log('DB Select Error:');
                console.log(err);
            }  
            var db = client.db('testdb');
            var find_name = {"id" : user.flightsId}
            // Oneway & mysql connected
            if (checkReturn=="oneway"){
                db.collection('flightsData').findOne(find_name, (err, bookCopy) => {
                    if (err) {
                        console.log('DB Select Error:');
                        console.log(err);
                    }        
                    bookCopy._id = new ObjectID()
                    bookCopy.userId = user.id
                    documentlength = bookCopy.offerItems[0].services[0].segments.length
                    departure = bookCopy.offerItems[0].services[0].segments[0].flightSegment.departure.iataCode
                    arrival = bookCopy.offerItems[0].services[0].segments[documentlength-1].flightSegment.arrival.iataCode
                    price = bookCopy.offerItems[0].price.total + bookCopy.offerItems[0].price.totalTaxes
                    depdate = bookCopy.offerItems[0].services[0].segments[0].flightSegment.departure.at.substring(0, 10)
                    db.collection("bookData").insertOne(bookCopy, (err) => {
                        if (err) {
                            console.log('DB Select Error:');
                            console.log(err);
                        }  
                        res.render('test', { price: price, rese: bookCopy.userId, user: user, departure: departure, arrival: arrival, AWS: AWS, depdate: depdate })
                    });
                });
            } else {
                // Return & mysql connected
                db.collection('flightsViaData').findOne(find_name, (err, bookCopy) => {
                    if (err) {
                        console.log('DB Select Error:');
                        console.log(err);
                    }          
                    bookCopy._id = new ObjectID()
                    bookCopy.userId = user.id
                    documentlength = bookCopy.offerItems[0].services[0].segments.length
                    departure = bookCopy.offerItems[0].services[0].segments[0].flightSegment.departure.iataCode
                    arrival = bookCopy.offerItems[0].services[0].segments[documentlength - 1].flightSegment.arrival.iataCode
                    price = bookCopy.offerItems[0].price.total + bookCopy.offerItems[0].price.totalTaxes
                    depdate = bookCopy.offerItems[0].services[0].segments[0].flightSegment.departure.at.substring(0, 10)
                    db.collection("bookData").insertOne(bookCopy, (err) => {
                        if (err) {
                            console.log('DB Select Error:');
                            console.log(err);
                        }  
                        res.render('test', { price: price, rese: bookCopy.userId, user: user, departure: departure, arrival: arrival, AWS: AWS, depdate: depdate })
                    });
                });
            };
        });
    };    
});

/* GET login page. */
router.get('/login', function(req,res){
  res.render('login')
})

/* GET reference page. */
router.get('/reference', function (req, res) {
  res.render('reference')
})

/* GET referenceError page. */
router.get('/referenceError', function (req, res) {
  res.render('referenceError')
})

/* POST reference page. */
router.post('/reference', function (req, res) {
    var sql = 'SELECT * FROM book WHERE firstname = ';
    var sql2 = ' AND lastname = ';
    var sql3 = ' AND phone = ';
    var sql4 = ' AND id = ';
    var user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone,
        reservNum: req.body.reservationNum,
    }
    var sql5 = sql + "'" + user.firstname + "'" + sql2 + "'" + user.lastname + "'" + sql3 + "'" + user.phone + "'" + sql4 + "'" + user.reservNum + "'";
    if (!con._connectCalled) {
        con.connect(function (err) {
            if (err) {
                console.log('DB Connection Error:');
                console.log(err);
            }  
            con.query(sql5, function (err, resultdata) {
                if (err) {
                    console.log('DB Select Error:');
                    console.log(err);
                }
                var db = client.db('testdb');
                reseNum = Number(user.reservNum)
                var find_name = { "userId": reseNum }
                db.collection('bookData').findOne(find_name, (err, bookCopy) => {
                    if (err) {
                        console.log('DB Select Error:');
                        console.log(err);
                    }  
                    if (bookCopy.offerItems[0].services.length==1) {
                        db.collection('dict').find({"carriers": { $exists:true}}).toArray((err, dict) => {
                            if (err) return console.log(err)
                            res.render('reference', { userdata: resultdata, bookCopy: bookCopy, dict:dict })
                        });
                    } else {
                        db.collection('viadict').find({"carriers": { $exists: true } }).toArray((err, dict) => {
                            if (err) return console.log(err)
                            res.render('reference', { userdata: resultdata, bookCopy: bookCopy, dict: dict })
                        });
                    }
                });
            });
        });
    } else {
    // If mysql is connected
        con.query(sql5, function (err, resultdata) {
            if (err) {
                console.log('DB Select Error:');
                console.log(err);
            }  
            var db = client.db('testdb');
            reseNum = Number(user.reservNum)
            var find_name = { "userId": reseNum }
            db.collection('bookData').findOne(find_name, (err, bookCopy) => {
                if (err) {
                    console.log('DB Select Error:');
                    console.log(err);
                }  
                if (bookCopy.offerItems[0].services.length == 1) {
                    db.collection('dict').find({ "carriers": { $exists: true } }).toArray((err, dict) => {
                        if (err) return console.log(err)
                        res.render('reference', { userdata: resultdata, bookCopy: bookCopy, dict: dict })
                    });
                } else {
                    db.collection('viadict').find({ "carriers": { $exists: true } }).toArray((err, dict) => {
                        if (err) return console.log(err)
                        res.render('reference', { userdata: resultdata, bookCopy: bookCopy, dict: dict })
                    });
                };
            });
        });
    };   
});

module.exports = router;
