const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());

// Create MySQL connection
const connection = mysql.createConnection({
    //   host: 'localhost',
    //   user: 'your_username',
    //   password: 'your_password',
    //   database: 'your_database',
    host: '103.228.83.115',
    user: 'root',
    password: 'Cylsys@678',
    database: 'hrms'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database');
        return;
    }
    console.log('Connected to database');
});



const DIR = "./uploads";




// Set up multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR); // Save images in the 'public/images' directory
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// API to insert products
app.post('/api/products', upload.single('productImages'), (req, res) => {
    const { productId, productName, productDescription, isActive } = req.body;
    const productImages = req.file ? req.file.filename : '';

    const sql = 'INSERT INTO `products` ( productName, productDescription, productImages, isActive) VALUES (?, ?, ?, ?)';
    // connection.query(sql, [productId, productName, productDescription, productImages, isActive], (err, result) => {
    //     if (err) {
    //         console.error('Error inserting product');
    //         res.sendStatus(500);
    //         return;
    //     }
    //     res.sendStatus(201);
    // });
    connection.query(sql, [ productName, productDescription, productImages, isActive], function (err, result) {
        if (err) {
            console.log("error: ", err);
            // result(err, null);
        } else {
            console.log(res);
            //  result(null, res.insertId);
            message = "Product Successfully";
            res.json({ error: false, message: message, status: "success", data: result.insertId });

        }
        //    console.log('inserted data');
    });
});




// API to get product information by productId
app.get('/api/products/:productId', (req, res) => {
    const productId = req.params.productId;

    const sql = 'SELECT * FROM products WHERE productId = ?';
    connection.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Error retrieving product information');
            res.sendStatus(500);
            return;
        }
        if (result.length === 0) {
            res.sendStatus(404);
            return;
        }
        res.json(result[0]);
    });
});

// API to get a list of active products available in the collection (Max 10 per page)
app.get('/api/products', (req, res) => {
    const page = req.query.page || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const sql = 'SELECT * FROM products WHERE isActive = 1 LIMIT ? OFFSET ?';
    connection.query(sql, [limit, offset], (err, result) => {
      
        if (err) {
            console.log("error: ", err);
            // result(err, null);
        } else {
            console.log(res);
            //  result(null, res.insertId);
            // message = "Product Successfully! uploaded";
            // res.json({ error: false, message: message, status: "success", data: result.insertId });

        }
        res.json(result);
    });
});

// API to update the product by productId
app.put('/api/products/:productId', upload.single('productImages'), (req, res) => {
    const productId = req.params.productId;
    const { productName, productDescription, isActive } = req.body;
    const productImages = req.file ? req.file.filename : '';

    const sql = 'UPDATE products SET productName = ?, productDescription = ?, productImages = ?, isActive = ? WHERE productId = ?';
    connection.query(sql, [productName, productDescription, productImages, isActive, productId], (err, result) => {
        // if (err) {
        //     console.error('Error updating product');
        //     res.sendStatus(500);
        //     return;
        // }
        // res.sendStatus(200);
        if (err) {
            console.log("error: ", err);
            // result(err, null);
        } else {
            console.log(res);
            //  result(null, res.insertId);
            message = "Product Successfully updated";
            res.json({ error: false, message: message, status: "success", data: result.insertId });

        }
    });
});

// API to delete a product by productId
app.delete('/api/products/:productId', (req, res) => {
    const productId = req.params.productId;

    const sql = 'DELETE FROM products WHERE productId = ?';
    connection.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Error deleting product');
            res.sendStatus(500);
            return;
        }
        res.sendStatus(200);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
