//Require sequelize models
var path = require('path');
let db = require("../models");
let searchMDN = require('../search_modules/search-mdn.js');
const searchStack = require('../search_modules/search-stack.js');
let getMDN = require('../search_modules/get-mdn-page.js');
let searchExpress = require('../search_modules/search-express.js');
const searchFuzzy = require('../search_modules/search-fuzzy.js');

module.exports = function(app) {

  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  app.get( '/api/express/search/:query', ( req, res ) => {
    searchExpress( req.params.query, ( err, results ) => {
      console.log('results', results);
      if (err) return console.log(err)
      res.send( results[0].html );
    })
  });

  //Returns array of objects with name and html keys
  app.get( '/api/express/methods/', ( req, res ) => {
    searchExpress( null,  ( err, results ) => {
      if ( err ) {
        console.log( err )
        throw err;
      }
      console.log( 'results', results );
      const methods = results.reduce( (string, elem) => string += '<li>' + elem.name + '</li>', '<ul>') + '</ul>';
      res.send(methods);
    });
  });

  //Queries MDN and requests a JSON response
  app.get('/api/mdn/search/:query', (req, res) => {
    searchMDN(req.params.query, (results) =>
      getMDN(results[0].url + '%24json', (results) =>
        res.json(results)));
  });

  app.get('/api/stack/search/:query', (req, res) => {
    searchStack(req.params.query, (err, results) => {
      if (err) throw err;
      // console.log(results);
      res.json(results);
    });
  });

  app.get('/api/express/fuzzy/:query', (req, res) => {
    //get method list
    searchExpress(null, (err, results) => {
      if (err) throw err;
      let matches = searchFuzzy(results, req.params.query);
      console.log(matches.reduce( (string, elem) => string += elem.item.name + '\n', ''));
      res.json(matches);
    });
  });

};
