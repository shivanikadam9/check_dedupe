var http = require('http');
const fs = require('fs');
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

app.post('/sub-form', upload.single('rfile'), (req, res) => {
    console.log(req.file);
    xlsxj({
        input: req.file.destination + req.file.filename,        //input file
        output: "output.json"                                   //Convert excel file to json file
    }, function(err, result) {                                  //error function
        if (err) {
            console.error(err);
        } else {                                                //results in json file
            // console.log(result);
        }
    });

    let rawdata = fs.readFileSync("output.json");               //read the json file
    let data = JSON.parse(rawdata);                             //parse the data and convert into javascript objects
    var l1 = data.length;                                       //no. of records for original data
    var d1 = new Date();
    var n1 = d1.getTime();                                      //time before dedupe process
    let rdata = dedupe(data);                                   //dedupe process to remove duplicate records
    // console.log(rdata);
    var d2 = new Date();
    var n2 = d2.getTime();                                      //Time after dedupe process is completed
    var t = n2-n1;                                              //difference of the time
    var l2 = rdata.length;                                      //no. of records after dedupe process
    var noDupli = l1 - l2;                                      //no. of duplicate records

    console.log("Time difference " + t);                        //print, time taken for dedupe process
     let data_new = JSON.stringify(rdata,null,2);               //stringify the new data
     console.log(l1);
     console.log(l2);

     console.log("no. of duplicate records : " + noDupli);      //print no. of duplicate records


    fs.writeFile('final_data.json',"Data  :  "+ data_new +" {Duplicate Records : "+ noDupli +"}          {Time Taken :  "+ t +"ms}", (err) => {
                                                                //write the file with new data
       if (err) throw err;
       console.log('Data written to file');
       res.sendFile(path.join(__dirname +'/final_data.json'));  //send the file on response
   });

});
