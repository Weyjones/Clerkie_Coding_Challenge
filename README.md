# 0. Dependency
I used ES7, MongoDB, Mongoose, Node, Express in this project. 

### importCSV.js
If this is your first time run this project and you have a empty database, you may want to use "importCSV.js" to import some sample data into the database first, you can just do "node importCSV.js".

### app.js
This file is the main server and inclueds the two APIs, `Upsert transactions` and `Get recurring transactions`. To build the server, run "node app.js"

# 1. Upsert transactions:
My deployment on EC2: 
http://ec2-107-20-93-160.compute-1.amazonaws.com:1984/upsert_transactions

### is_recurring logic:
This api will add the transactions into database, for each inserted transecation, the program predicts a next transaction based on the previous recurring transaction's date and amount in the same group. For the new transaction and the predicted transaction, if the difference of their date is within 4 days, and the amount for the new transaction is not larger or smaller  20% of the predicted transaction, then the new transaction will have is_recurring set to `true`.

## Expect input:
This post api accepts a (application/json) transction array with key as "transArr".

### Example input for this post requset:
```
{
	"transArr": [
       {"name": "YMCA",
        "date": "2018-08-17T09:04:00.000Z",
        "amount": 68.33,
        "trans_id": 120,
        "user_id": 1 },
       {"name": "VPN Service",
        "date": "2019-05-22T07:00:00.000Z",
        "amount": 9.99,
        "trans_id": 122,
        "user_id": 1 }
	]
}
```
# 2. Get recurring transactions:
My deployment on EC2: 
http://ec2-107-20-93-160.compute-1.amazonaws.com:1984/get_recurring_trans