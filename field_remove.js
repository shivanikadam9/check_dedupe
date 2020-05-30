var http = require('http');
const fs = require('fs');
var path = require('path');
var multer  = require('multer');
var dedupe = require('dedupe');
var xlsxj = require("xlsx-to-json");
const express = require('express');
var app = express();
var upload = multer({ dest: 'uploads/' })


app.use(express.urlencoded())
console.log(__dirname);
app.use(express.static(__dirname ));
app.listen(8000,() => console.log("Server is running"));       //serving the files on localhost port 8000



app.post('/sub-form',upload.single('rfile'),(req,res) => {
  xlsxj({
      input: req.file.destination + req.file.filename,         //input file
      output: "output.json"                                    //Convert excel file to json file
  }, function(err, result) {                                   //error function
      if (err) {
          console.error(err);
      } else {
         // console.log(result);                               //results in json file
      }
  });

   let rawdata = fs.readFileSync("output.json");               //read the json file
   var filter = req.body.ftext;                                //By which fields you want to filter
   var filterArr = filter.split(',');                          //comma  separator

   let data = JSON.parse(rawdata);                             //parse the original data
   var d1 = new Date();                                        //get time before dedupe process

   let rdata = dedupe(data, value => value[filterArr[0]],value => value[filterArr[1]],value => value[filterArr[2]]);
                                                               //dedupe according to fields
    var d2 = new Date();
    var t = d2.getTime()-d1.getTime();                         //time difference for dedupe
    var noDupli = data.length - rdata.length;                  //no. of duplicate records

    let data_new = JSON.stringify(rdata,null,2);               //stringyfy the new data

    fs.writeFile('final_data.json',"Data  :  "+ data_new +" {Duplicate Records : "+ noDupli +"}          {Time Taken :  "+ t +"ms}", (err) => {
       if (err) throw err;                                     //write data into the file
       console.log('Data written to file');
       res.sendFile(path.join(__dirname +'/final_data.json')); //send response
   });

});
