import express, { Request, Response } from "express";
import cors from "cors";
import { generateRecommendations, Book } from "./recommendationModel";
import { fetchBookData } from "./fetchBookData";

const app = express();
const port = 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.post("/api/", async (req: Request, res: Response) => {
    const { book_name, user_preferences, user_library } = req.body;
    if (!book_name || !user_preferences) {
        return res.status(400).json({ error: "Missing book name or user preferences" });
    }

    try {
        const books: Book[] = await fetchBookData(book_name);
        const recommendations = await generateRecommendations(book_name, books, user_library, user_preferences);
        res.json(recommendations);
    } catch (error) {
        console.error("Error processing recommendation:", error);
        res.status(500).json({ error: "Error processing recommendation" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
