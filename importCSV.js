// I write this file to insert the original data into mongoDB
// Please don't run this script if the database already has data.

const fs = require('fs');
const mongoose = require('mongoose');
const Transaction = require('./transactionSchema');
mongoose.connect(
    'mongodb+srv://<user>:<password>@cluster0-unbjh.mongodb.net/interview_challenge?retryWrites=true',
    { useNewUrlParser: true }
);

let strBuffer;

fs.readFile('sample_transactions.csv',(err, data) => {
    if (err) {
        return console.log(err);
    }
    strBuffer = data.toString(); //put all data into buffer as a string
    let arr = strBuffer.split('\r\n'); // break the data into array line by line
    let objArr = []; 
    let headers = arr[0].split(',');
    console.log('Finsih reading csv file...');
    // the following for loop put all data as object into objArr
    for(let i = 1; i < arr.length; i++) {
        let data = arr[i].split(',');
        let obj = {};
        for(let j = 0; j < data.length; j++) {
            let header = headers[j].trim();
            let content;
            switch(header) {
                case 'name':
                    content = data[j].trim();
                    break;
                case 'date':
                    content = new Date(data[j].trim());
                    break;
                case 'amount':
                    content = parseFloat(data[j].trim());
                    break;
                case 'trans_id':
                    content = parseInt(data[j].trim());
                    break;
                case 'user_id':
                    content = parseInt(data[j].trim());
                    break;
                case 'is_recurring':
                    content = data[j].trim() === 'TRUE';
                    break;
            }
            obj[header] = content;
        }
        objArr.push(obj);
    }
    console.log('Finsih converting csv to object...');
    Transaction.create(objArr, (err) => {
        if (err) {
            console.log(err);
        }
    });
    console.log('Finsih updating mongodb. Please exit.');
});