const express = require('express')
const mysql = require('mysql2')
const app = express()
const path = require('path');
const cors = require('cors')
const port = 4000


const https = require('https');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'UX23Y24%@&2aMb';

// Load SSL certificates
const privateKey = fs.readFileSync('privatekey.pem', 'utf8');
const certificate = fs.readFileSync('certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

//Database(MySql) configulation
const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "1234",
        database: "shopdee"
    }
)
db.connect()

//Middleware (Body parser)
app.use(express.json())
app.use(express.urlencoded ({extended: true}))
app.use(cors()); // Enable CORS to be Middleware 


//Hello World API
app.get('/', function(req, res){
    res.send('Hello World!')
});



// Register
app.post('/api/register', 
    function(req, res) {  
        const { username, password, firstName, lastName } = req.body;
        
        //check existing username
        let sql="SELECT * FROM customer WHERE username=?";
        db.query(sql, [username], async function(err, results) {
            if (err) throw err;
            
            if(results.length == 0) {
                //password and salt are encrypted by hash function (bcrypt)
                const salt = await bcrypt.genSalt(10); //generate salte
                const password_hash = await bcrypt.hash(password, salt);        
                                
                //insert customer data into the database
                sql = 'INSERT INTO customer (username, password, firstName, lastName) VALUES (?, ?, ?, ?)';
                db.query(sql, [username, password_hash, firstName, lastName], (err, result) => {
                    if (err) throw err;
                
                    res.send({'message':'ลงทะเบียนสำเร็จแล้ว','status':true});
                });      
            }else{
                res.send({'message':'ชื่อผู้ใช้ซ้ำ','status':false});
            }

        });      
    }
);


//Login
app.post('/api/login',
    async function(req, res){
        //Validate username
        const {username, password} = req.body;                
        let sql = "SELECT * FROM customer WHERE username=? AND isActive = 1";        
        let customer = await query(sql, [username, username]);        
        
        if(customer.length <= 0){            
            return res.send( {'message':'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง','status':false} );
        }else{            
            customer = customer[0];
            custID = customer['custID'];               
            password_hash = customer['password'];       
        }

        //validate a number of attempts 
        let loginAttempt = 0;
        sql = "SELECT loginAttempt FROM customer WHERE username=? AND isActive = 1 ";        
        sql += "AND lastAttemptTime >= CURRENT_TIMESTAMP - INTERVAL 24 HOUR ";        
        
        row = await query(sql, [username, username]);    
        if(row.length > 0){
            loginAttempt = row[0]['loginAttempt'];

            if(loginAttempt>= 3) {
                return res.send( {'message':'บัญชีคุณถูกล๊อก เนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด','status':false} );    
            }    
        }else{
            //reset login attempt                
            sql = "UPDATE customer SET loginAttempt = 0, lastAttemptTime=NULL WHERE username=? AND isActive = 1";                    
            await query(sql, [username, username]);               
        }              
        

        //validate password       
        if(bcrypt.compareSync(password, password_hash)){
            //reset login attempt                
            sql = "UPDATE customer SET loginAttempt = 0, lastAttemptTime=NULL WHERE username=? AND isActive = 1";        
            await query(sql, [username, username]);   

            //get token
            const token = jwt.sign({ custID: custID, username: username }, SECRET_KEY, { expiresIn: '1h' });                

            customer['token'] = token;
            customer['message'] = 'เข้าสู่ระบบสำเร็จ';
            customer['status'] = true;

            res.send(customer);            
        }else{
            //update login attempt
            const lastAttemptTime = new Date();
            sql = "UPDATE customer SET loginAttempt = loginAttempt + 1, lastAttemptTime=? ";
            sql += "WHERE username=? AND isActive = 1";                   
            await query(sql, [lastAttemptTime, username, username]);           
            
            if(loginAttempt >=2){
                res.send( {'message':'บัญชีคุณถูกล๊อก เนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด','status':false} );    
            }else{
                res.send( {'message':'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง','status':false} );    
            }            
        }

    }
);


// Function to execute a query with a promise-based approach
function query(sql, params) {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
}

// API ดึงข้อมูลโปรไฟล์ (ไม่ต้องใช้ Token)
app.get('/api/profile/:id', (req, res) => {
    const custID = req.params.id;

    // ดึงข้อมูลจาก MySQL
    let sql = "SELECT * FROM customer WHERE custID = ? AND isActive = 1";
    db.query(sql, [custID], (err, result) => {
        if (err) {
            console.error("❌ SQL Error: " + err);
            return res.status(500).json({ message: "เกิดข้อผิดพลาด", status: false });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลลูกค้า", status: false });
        }

        let customer = result[0];
        customer.message = "ข้อมูลโปรไฟล์ของคุณ";
        customer.status = true;

        res.json(customer);
    });
});

//Product Detail
app.get('/api/products/:id', (req, res) => {
    const productID = req.params.id;

    let sql = "SELECT * FROM product WHERE productID = ?";
    db.query(sql, [productID], (err, result) => {
        if (err) {
            console.error("❌ SQL Error: " + err);
            return res.status(500).json({ message: "เกิดข้อผิดพลาด", status: false });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลสินค้า", status: false });
        }

        let product = result[0];
        product.message = "ข้อมูลสินค้า";
        product.status = true;

        res.json(product);
    });
});




// Get all products
app.get('/api/products', async function (req, res) {
    try {
        let sql = "SELECT * FROM product";
        let products = await query(sql);

        res.send({
            message: 'Product list retrieved successfully',
            status: true,
            products: products
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error retrieving products',
            status: false,
            error: error.message
        });
    }
});



// Serve a product image
app.get('/api/product/image/:imageFile', async function (req, res) {
    try {
        
        // If the imageFile is a filename (e.g., stored in /uploads directory)
        const imageFile = req.params.imageFile;
        const imagePath = path.join(__dirname, 'public/assets/product', imageFile);
        res.sendFile(imagePath);

        // If the imageFile is binary data, convert it to an image
        // res.setHeader('Content-Type', 'image/jpeg'); // Change based on stored image type
        // res.send(Buffer.from(imageFile, 'binary'));

    } catch (error) {
        res.status(500).send({
            message: 'Error retrieving product image',
            status: false,
            error: error.message
        });
    }
});



// Serve a profile image
app.get('/api/profile/image/:imageFile', async function (req, res) {
    try {
        
        // If the imageFile is a filename (e.g., stored in /uploads directory)
        const imageFile = req.params.imageFile;
        const imagePath = path.join(__dirname, 'public/assets/customer', imageFile);
        res.sendFile(imagePath);

        // If the imageFile is binary data, convert it to an image
        // res.setHeader('Content-Type', 'image/jpeg'); // Change based on stored image type
        // res.send(Buffer.from(imageFile, 'binary'));

    } catch (error) {
        res.status(500).send({
            message: 'Error retrieving product image',
            status: false,
            error: error.message
        });
    }
});

app.put('/api/profile/:id', (req, res) => {
    const custID = req.params.id;
    const { firstName, lastName, email, mobilePhone } = req.body;
  
    let sql = "UPDATE customer SET firstName = ?, lastName = ?, email = ?, mobilePhone = ? WHERE custID = ?";
    db.query(sql, [firstName, lastName, email, mobilePhone, custID], (err, result) => {
      if (err) {
        console.error("❌ SQL Error: " + err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", status: false });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบข้อมูลลูกค้า", status: false });
      }
  
      res.json({ message: "ข้อมูลถูกอัปเดตเรียบร้อยแล้ว", status: true });
    });
  });


// Create an HTTPS server
//const httpsServer = https.createServer(credentials, app);
app.listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
});