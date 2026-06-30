require("dotenv").config({path:'../../.env'});
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ================= DB CONNECTION =================
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});
console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
});

// db.on("connection",(con)=>{
//     if(con){
//         console.log("Connection established")
//     }
// })

// Check DB connection
db.getConnection((err, conn) => {
    if (err) {
        console.error('❌ MySQL Connection Failed:', err.message);
    } else {
        console.log('✅ Connected to MySQL Database');
        conn.release();
    }
});

// ================= ROUTES =================

// GET all campaigns
app.get('/api/campaigns', (req, res) => {
    db.query('SELECT * FROM campaigns ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET all admin users
app.get('/api/admin_credentials', (req, res) => {
    db.query('SELECT * FROM admin_credentials ORDER BY id DESC', (err, results) => {
       if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            }
        res.json(results);
    });
});

// POST campaign
app.post('/api/campaigns', (req, res) => {
    const { title, type, tags, asanaLink, code, imageUrl, cwcCode } = req.body;

    const tagString = Array.isArray(tags) ? tags.join(', ') : tags;

    const sql = `
        INSERT INTO campaigns (title, type, tags, asanaLink, code, imageUrl, cwcCode)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [title, type, tagString, asanaLink, code, imageUrl, cwcCode], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
            id: result.insertId,
            title,
            type,
            tags: tagString,
            asanaLink,
            code,
            imageUrl,
            cwcCode
        });
    });
});

// PUT (Update)
app.put('/api/campaigns/:id', (req, res) => {
    const { id } = req.params;
    const { title, type, tags, asanaLink, code, imageUrl, cwcCode} = req.body;

    const tagString = Array.isArray(tags) ? tags.join(', ') : tags;

    const sql = `
        UPDATE campaigns
        SET title=?, type=?, tags=?, asanaLink=?, code=?, imageUrl=?, cwcCode=?
        WHERE id=?
    `;

    db.query(sql, [title, type, tagString, asanaLink, code, imageUrl, cwcCode, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        res.json({ message: 'Campaign updated successfully' });
    });
});

// DELETE
app.delete('/api/campaigns/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM campaigns WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: 'Campaign deleted successfully' });
    });
});

// ================= SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/campaigns`);
    console.log(`📡 API: http://localhost:${PORT}/api/admin_credentials`);
});