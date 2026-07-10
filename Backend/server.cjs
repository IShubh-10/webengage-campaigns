require("dotenv").config({path:"../.env"});
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

// GET all campaign_hub
// app.get('/api/campaign_hub', (req, res) => {
//     db.query('SELECT * FROM campaign_hub ORDER BY id DESC', (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(results);
//     });
// });
app.get('/api/campaign_hub', (req, res) => {

    const showDeleted = req.query.showDeleted === "true";

    let sql;

    if (showDeleted) {
        sql = "SELECT * FROM campaign_hub ORDER BY id DESC";
    } else {
        sql = "SELECT * FROM campaign_hub WHERE status='Active' ORDER BY id DESC";
    }

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(results);
    });
});

// GET all admin users
app.post("/api/admin_credentials", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required."
        });
    }

    // FIX: table only has id, username, userpassword -- no "role" column.
    // Selecting "role" caused ER_BAD_FIELD_ERROR (1054) -> 500 on every login.
    const sql = `
        SELECT id, username
        FROM admin_credentials
        WHERE LOWER(username) = LOWER(?)
        AND userpassword = ?
        LIMIT 1
    `;

    db.query(sql, [username.trim(), password], (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const user = results[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: "admin" // no role column in DB, every whitelisted login is admin
            }
        });

    });

});

// POST campaign
app.post('/api/campaign_hub', (req, res) => {
    // Extracted the 'created_by' field containing the email from the client body payload
    const { title, type, tags, asanaLink, code, imageUrl, cwcCode, created_by } = req.body;

    const tagString = Array.isArray(tags) ? tags.join(', ') : tags;
    // Fallback default value if no valid email identifier is provided
    const creatorEmail = created_by || 'Unknown Admin'; 

    const sql = `
        INSERT INTO campaign_hub (title, type, tags, asanaLink, code, imageUrl, cwcCode, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [title, type, tagString, asanaLink, code, imageUrl, cwcCode, creatorEmail], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
            id: result.insertId,
            title,
            type,
            tags: tagString,
            asanaLink,
            code,
            imageUrl,
            cwcCode,
            created_by: creatorEmail
        });
    });
});

// PUT (Update)
app.put('/api/campaign_hub/:id', (req, res) => {
    const { id } = req.params;
    const { title, type, tags, asanaLink, code, imageUrl, cwcCode, created_by } = req.body;

    const tagString = Array.isArray(tags) ? tags.join(', ') : tags;
    const creatorEmail = created_by || 'Unknown Admin';

    const sql = `
        UPDATE campaign_hub
        SET title=?, type=?, tags=?, asanaLink=?, code=?, imageUrl=?, cwcCode=?, created_by=?
        WHERE id=?
    `;

    db.query(sql, [title, type, tagString, asanaLink, code, imageUrl, cwcCode, creatorEmail, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        res.json({ message: 'Campaign updated successfully' });
    });
});

// DELETE
// app.delete('/api/campaign_hub/:id', (req, res) => {
//     const { id } = req.params;

//     db.query("UPDATE campaign_hub SET status='Deleted' WHERE id=?", [id], (err) => {
//         if (err) return res.status(500).json({ error: err.message });

//         res.json({ message: 'Campaign deleted successfully' });
//     });
// });
app.delete('/api/campaign_hub/:id', (req, res) => {
    const { id } = req.params;

    console.log("Deleting campaign:", id);

    db.query(
        "UPDATE campaign_hub SET status = 'Deleted' WHERE id = ?",
        [id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            }

            console.log(result);

            res.json({
                affectedRows: result.affectedRows,
                changedRows: result.changedRows
            });
        }
    );
});

// ================= SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/campaign_hub`);
    console.log(`📡 API: http://localhost:${PORT}/api/admin_credentials`);
});