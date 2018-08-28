const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('./transactionSchema');
const bodyParser = require("body-parser");
mongoose.connect(
    'mongodb+srv://<user>:<password>@cluster0-unbjh.mongodb.net/interview_challenge?retryWrites=true',
    { useNewUrlParser: true,
      connectTimeoutMS: 10000 }
);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/upsert_transactions', (request, response, next) => {
    upsertTransactions(request,response);
    getRecurringTrans(request,response);
});

app.get('/get_recurring_trans', (request, response) => {
    getRecurringTrans(request,response);
});

app.listen(1984, () => {
    console.log('finish building server')
})

// this method will analyze all input trans' is_recurring and put them into the database
async function upsertTransactions (request, response) {
    let transArr = request.body.transArr;
    if (!transArr || transArr.length === 0) {
        return;
    }
    let objArr = [];
    for (let i = 0; i < transArr.length; i++) {
        await isRecurring(transArr[i]).then(isRecur => {
            let obj = {
                name: transArr[i].name,
                date: new Date(transArr[i].date),
                amount: parseFloat(transArr[i].amount),
                trans_id: parseInt(transArr[i].trans_id),
                user_id: parseInt(transArr[i].user_id),
                is_recurring: isRecur ? true : false
            };
            return obj;
        }).then(obj => {
            objArr.push(obj);
        })
    }
    //write to database
    await Transaction.create(objArr, (err) => {
        if (err) {
            console.log(err);
        }
    });  
}


function getRecurringTrans(request, response) {
    Transaction.find({is_recurring: true}, "name")
    .then(res => {
        let componySet = new Set();
        res.forEach(n => {
            componySet.add(n.name.split(' ')[0]);
        });
        return componySet;  
    })
    .then(companySet => { 
        return new Promise((resolve, reject) => {
            let resArr = [];
            companySet.forEach(compony => {
                Transaction.find(
                    {name: new RegExp('^' + compony), is_recurring: true},
                     (err,res) => {
                    let next = predictNext(res);
                    resArr.push(next);
                    if (resArr.length === companySet.size) {
                        resolve(resArr);
                    }
                });        
            });
        });
    })
    .then(resArr => {
        resArr.sort((a, b) => {
                if(a.name < b.name) return -1;
                if(a.name > b.name) return 1;
                return 0;
        });
        response.status(201).json(resArr);
    })
    .catch(err => {
        console.log(err);
    });
}

function predictNext(transArr) {
    let size = transArr.length;
    transArr.sort((a, b) => a.date - b.date);
    let interval = 0;
    let amount = transArr[0].amount;
    for (let i = 1; i < size; i++) {
        interval += Math.abs(transArr[i].date - transArr[i - 1].date);
        amount += transArr[i].amount;
        delete transArr[i]._id;
    }
    interval = interval / (size - 1);
    amount = amount / size;
    let newDate = new Date(transArr[size - 1].date);
    newDate.setTime(newDate.getTime() + interval);
    newDate.setHours(transArr[size - 1].date.getHours());
    let res = {
        name: transArr[size - 1].name,
        user_id: transArr[size - 1].user_id,
        next_amt: Math.round(amount * 100) / 100,
        next_date: newDate,
        transactions: transArr
    }
    return res;
}

// this method check if the new trans is a recurring transaction
async function isRecurring(trans) {
    let compony = trans.name.split(' ')[0];
    let is_recurring;
    await Transaction.find({name: new RegExp('^' + compony), is_recurring: true}, (err, res) => {
        if (res.length !== 0) {
            let next = predictNext(res);
            let dateRecurr = Math.abs(new Date(trans.date) - new Date(next.next_date)) < 345600000; // within 4 days
            let amountRecurr = trans.amount > next.next_amt * 0.8 && trans.amount < next.next_amt * 1.2; // no more different than 20%
            is_recurring = dateRecurr && amountRecurr;
        } else {
            is_recurring = false;
        } 
    });    
    return is_recurring;
}
