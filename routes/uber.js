/**
 * Created by Forrest on 6/18/17.
 */
const express = require('express')
const router = express.Router()
var request=require("request")
var cors = require('cors')

let config= require('../config/uber_config')
var rq= require('request-promise')
const mongoose= require("mongoose")





var node_uber = require('node-uber');


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


// uber login
router.get('/',cors(), function(request, response) {

    var url = uber.getAuthorizeUrl(['history','profile', 'request', 'places','all_trips']);


    response.redirect(url);
});



router.get('/product',function(req,res){
    uber.products.getAllForAddressAsync('1056 Commonwealth Avenue, Boston, MA 02215, US')
        .then(function(res) { console.log(res); })
        .error(function(err) { console.error(err); });


})


// get token
router.get('/token',function (req,res) {
    uber.authorizationAsync({ refresh_token: 'REFRESH_TOKEN' })
        .spread(function(access_token, refresh_token, authorizedScopes, tokenExpiration) {
            // store the user id and associated access_token, refresh_token, scopes and token expiration date
            console.log('New access_token retrieved: ' + access_token);
            console.log('... token allows access to scopes: ' + authorizedScopes);
            console.log('... token is valid until: ' + tokenExpiration);
            console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);
        })
        .error(function(err) { console.error(err); });

})



router.get('/callback',cors(), function(request, response) {
    uber.authorizationAsync({authorization_code: request.query.code})
        .spread(function(access_token, refresh_token, authorizedScopes, tokenExpiration) {
            // store the user id and associated access_token, refresh_token, scopes and token expiration date
            console.log('New access_token retrieved: ' + access_token);
            console.log('... token allows access to scopes: ' + authorizedScopes);
            console.log('... token is valid until: ' + tokenExpiration);
            console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);

            response.cookie("authStatus","true")

            //need to redirect to a html
            // redirect the user back to your actual app
            response.redirect('/');
        })
        .error(function(err) {
            console.error(err);
        });
});

// Initialize uber in db
router.get('/uberinit',function(req,res){

    let uber_pool = new car({car_type: "uberpool"})
    uber_pool.save()

    res.send("Initializing uber")


})

//get the price and time, save them into db
router.get('/uberP', function (req,res) {
    const result= uber.estimates.getPriceForRouteByAddressAsync(
        '1056 Commonwealth Avenue, Boston, MA 02215, US',
        '700 Commonwealth Avenue, Boston, MA 02215, US')
        .then( function(result) {
            let uprice= result.prices[0].estimate
            mongoose.findOneAndUpdate({car_type: "uberpool"}, {price: uprice},function(err,outcome){
                    if(err){res.send("errorrrrrr")}
                    else{res.json("Finally success")}

                }
            )
        })
        .error(function(err) { console.error(err); });

})


//get the time and price interval
router.get('/estPrice', function (req,res) {
    const price= uber.estimates.getPriceForRouteByAddressAsync(
        '1056 Commonwealth Avenue, Boston, MA 02215, US',
        '700 Commonwealth Avenue, Boston, MA 02215, US')
        .then( function(price) {
            console.log(price)
        res.json(price)})
        .error(function(err) { console.error(err); });

})

router.get('/estTime',function(req,res){
    const time= uber.estimates.getETAForAddressAsync('1056 Commonwealth Avenue, Boston, MA 02215, US')
        .then(function(time) { console.log(time);
        res.json(time)})
        .error(function(err) { console.error(err); });

});


// This is for future Alexa use
// router.get('/specificPrice', function(res,req,next){
//     let Token = config.server_token
//
//     let uberAPI = 'https://api.uber.com/v1.2/requests/estimate'
//     let uberOptions = {
//         headers: {
//             'Authorization': Token,
//             'Accept-Language': 'en_US',
//             'Content-Type': 'application/json'
//         },
//         qs: {
//             'start_latitude': '37.7752315',
//             'start_longitude': '-122.418075',
//             'end_latitude': '37.7752415',
//             'end_longitude': '-122.518075'
//         }
//     }
//     rq.post(uberAPI, uberOptions)
//         .then (function (err, response) {
//             console.log(response)
//         })
//
// })



module.exports = router;