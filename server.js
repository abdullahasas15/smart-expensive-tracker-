import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pool from "./database.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());
app.set("view engine", "ejs");

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Database connection error", err);
    } else {
        console.log("Connected to DB at", res.rows[0].now);
    }
});

// Home route - Fetch and display expenses
app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM expenses ORDER BY date DESC");
        res.render("index", { expenses: result.rows }); // Fixed `row` to `rows`
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/add", async (req, res) => {
    try {
        let { title, category, amount, date } = req.body;

        // Debug: Log received values
        console.log("Received:", { title, category, amount, date });

        // Convert category to match DB format
        category = category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();

        // Debug: Log formatted category
        console.log("Formatted Category:", category);

        const allowedCategories = ["food", "travel", "shopping", "entertainment", "bills", "others"];

        if (!allowedCategories.includes(category.toLowerCase().trim())) {
            return res.status(400).send("Invalid category: " + category);
        }

        // Ensure date is provided
        if (!date) {
            date = new Date().toISOString().split("T")[0];
        }

        // Insert into DB
        const result = await pool.query(
            "INSERT INTO expenses (title, category, amount, date) VALUES ($1, $2, $3, $4) RETURNING *",
            [title, category, amount, date]
        );

        console.log("Expense added:", result.rows[0]);
        res.redirect("/");
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).send("Internal Server Error");
    }
});
// Fetch data for chart
app.get("/chart-data", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT TO_CHAR(date, 'YYYY-MM') AS month, SUM(amount) AS total FROM expenses GROUP BY month ORDER BY month"
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching chart data:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));