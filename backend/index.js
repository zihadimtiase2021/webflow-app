const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// রেলওয়ে অটোমেটিক পোর্ট অ্যাসাইন করবে, না পেলে 3000
const PORT = process.env.PORT || 3000;

// API টেস্ট রাউট
app.get('/api/status', (req, res) => {
    res.json({ status: 'Backend is fully connected and running!' });
});

// প্রোডাকশনের জন্য React Frontend সার্ভ করা
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// যেকোনো অজানা রাউটে ইউজার গেলে React-এর index.html সার্ভ করবে
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});