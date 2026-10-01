const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// HOME / SERVER TEST

app.get("/", (req, res) => {

    res.json({
        message: "LectureLens Backend is running"
    });

});

// DATABASE CONNECTION TEST

app.get("/db-test", async (req, res) => {

    try {

        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });

    } catch (error) {

        console.error("Database connection error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });

    }

});

// START SERVER

app.listen(PORT, () => {

    console.log(
        `LectureLens backend running on port ${PORT}`
    );

});