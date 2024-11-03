const express = require("express");
const cors = require("cors");
const { generateRecommendations } = require("./recommendationModel");
const { fetchBookData } = require("./fetchBookData");

const app = express();
const port = 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.post("/api/", async (req, res) => {
    const { book_name, user_id } = req.body;
    if (!book_name || !user_id) {
        return res.status(400).json({ error: "Missing book name or user ID" });
    }

    try {
        const books = await fetchBookData(book_name);
        //console.log("Fetched book data:", books);

        const recommendations = await generateRecommendations(book_name, books);
        //console.log("Generated recommendations:", recommendations);

        res.json(recommendations);
    } catch (error) {
        console.error("Error processing recommendation:", error);
        res.status(500).json({ error: "Error processing recommendation" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
