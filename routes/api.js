/**
 * Created by Forrest on 6/19/17.
 */

const express = require('express')
const router = express.Router()
var request=require("request")
const mongoose= require("mongoose")
var node_uber = require('node-uber');
let config= require('../config/uber_config')
var cors = require('cors')


var Schema = mongoose.Schema;
var carSchema = new Schema ({
    car_type: String,
    time: String,
    price: String
});
var car = mongoose.model('car', carSchema);





// get all the cars in the db

router.get('/',cors(), function (req, res, next) {
    // print out all the car
    if(!req.cookies.authStatus){
        res.redirect('/') }
    else {
        car.find({}, function (err, results) {
            res.json(results);
        })
    }

})

// initialize the buses in the db

router.get('/businit',function(req,res){
    //Initialize 2 upcoming buses

    let bus_1 = new car({car_type: "bus1", price: "1.75"})
    let bus_2 = new car({car_type: "bus2", price: "1.75"})
    bus_1.save()
    bus_2.save()
    res.send("Initializing 2 upcoming buses")




})


//get the time of upcoming buses from API and store the time into db

router.get('/busTime',cors(),function(req, res){
    if(!req.cookies.authStatus){
        console.log("Please log in")
        res.redirect('/') }

    else {
        var options = {
            method: 'GET',
            url: "http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=mbta&r=57&stopId=00933"
        }

        request(options, function (error, response) {
            if (error) {
                throw new Error(error)
            }
            else {
                // the right way
                //let result= JSON.parse(response.body)

                let result = JSON.parse(response.body)
                let bus_time_1 = result.predictions.direction.prediction[0].seconds / 60
                car.findOneAndUpdate({car_type: "bus1"}, {time: bus_time_1}, function (err, outcome) {
                        if (err) {
                            console.log(error)
                        }
                        else {
                            console.log("Bus 1 time is updated")
                        }

                    }
                )
                let bus_time_2 = result.predictions.direction.prediction[1].seconds / 60
                car.findOneAndUpdate({car_type: "bus2"}, {time: bus_time_2}, function (err, outcome) {
                        if (err) {
                            console.log(error)
                        }
                        else {
                            console.log("Bus 2 time is updated")
                        }

                    }
                )
            }


        })
    }


});




// uber part


var uber = new node_uber({
    client_id: config.client_id,
    client_secret: config.client_secret,
    server_token:  config.server_token,
    refresh_token: config.refresh_token,
    redirect_uri: 'http://localhost:3000/uber/callback',
    access_token: config.access_token,
    name: 'price and time',
    language: 'en_US', // optional, defaults to en_US
    sandbox: true // optional, defaults to false
});

// Initialize uber in db
router.get('/uberinit',function(req,res){

    let uber_pool = new car({car_type: "uberpool", price: "2.75"})
    uber_pool.save()

    res.send("Initializing uber")


})

//get the price and time, save them into db
router.get('/uberP',cors(), function (req,res) {
    if(!req.cookies.authStatus){
        console.log("Please log in")
        res.redirect('/') }
    else {
        const price_feeback = uber.estimates.getPriceForRouteByAddressAsync(
            '1056 Commonwealth Avenue, Boston, MA 02215, US',
            '700 Commonwealth Avenue, Boston, MA 02215, US')
            .then(function (price_feeback) {
                let uprice = price_feeback.prices[0].estimate[1]

                car.findOneAndUpdate({car_type: "uberpool"}, {price: uprice}, function (err, outcome) {
                        if (err) {
                            console.log("Error")
                        }
                        else {
                            console.log("Uber Price is updated")
                        }

                    }
                )
            })
            .error(function (err) {
                console.error(err);
            });
    }

})

router.get('/uberT',cors(),function(res,req){
    if(!req.cookies.authStatus){
        console.log("Please log in")
        res.redirect('/') }
    else {
        const time_feedback = uber.estimates.getETAForAddressAsync('1056 Commonwealth Avenue, Boston, MA 02215, US')
            .then(function (time_feedback) {
                let utime = time_feedback.times[0].estimate / 60


                car.findOneAndUpdate({car_type: "uberpool"}, {time: utime}, function (err, outcome) {
                    if (err) {
                        console.log("errorr")
                    }
                    else {
                        console.log("Uber time is updated")
                    }
                })

            })
            .error(function (err) {
                console.error(err);
            });
    }

})




//The algorithm helps you to decided

router.get('/algo',cors(), function(req, res) {
    if(!req.cookies.authStatus){
        console.log("Please log in")
        res.send('Please login') }
    else {
        car.find({}, function (err, results) {

            let bus1 = results[0]
            let bus1_time = bus1.time
            let bus1_price = bus1.price

            let bus2 = results[1]
            let bus2_time = bus2.time
            let bus2_price = bus2.price

            let uber = results[2]
            let uber_time = uber.time
            let uber_price = uber.price


            if ((3 <= bus1_time && bus1_time <= 6) || (3 <= bus2_time && bus2_time <= 7)) {
                res.send("Take Bus")
            }
            else if (uber_price <= 3) {
                res.send("Take Uber")
            }

            else {
                res.send("Decide yourself")
            }

        })
    }

})













module.exports = router;
