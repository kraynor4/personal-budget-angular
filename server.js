const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static('public'));

// const budget = {
//     myBudget: [
//     {
//         title: 'Eat Out',
//         budget: 25
//     },
//     {
//         title: 'Rent',
//         budget: 375
//     },
//     {
//         title: 'Groceries',
//         budget: 110
//     },
//     ]
// };

app.get('/hello', (req, res) => {
    res.send('Hello World!');
    });

// Endpoint to serve the budget data
app.get('/budget', (req, res) => {
    // Read the budget.json file
    fs.readFile('budget.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading budget.json:', err);
            res.status(500).send('Server Error');
            return;
        }
        // Send the JSON data as a response
        res.json(JSON.parse(data));
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    });
// End of app.get('/budget')
