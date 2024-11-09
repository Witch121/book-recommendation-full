import express, { Request, Response } from "express";
import cors from "cors";
import { generateRecommendations, Book, UserPreferences } from "./recommendationModel";
import { fetchBookData } from "./fetchBookData";
import { db } from "../src/components/firebaseFolder/firebase";
import { doc, getDoc } from "firebase/firestore";

const app = express();
const port = 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as UserPreferences) : null;
    } catch (error) {
        console.error("Error fetching user preferences:", error);
        return null;
    }
}

app.post("/api/", async (req: Request, res: Response) => {
    const { book_name, user_id } = req.body;
    if (!book_name || !user_id) {
        return res.status(400).json({ error: "Missing book name or user ID" });
    }

    try {
        const books: Book[] = await fetchBookData(book_name);
        const userPreferences = await getUserPreferences(user_id) || { favoriteGenres: [], favoriteAuthors: [], favoriteBooks: [] };
        const recommendations = await generateRecommendations(book_name, books, [], userPreferences);
        res.json(recommendations);
    } catch (error) {
        console.error("Error processing recommendation:", error);
        res.status(500).json({ error: "Error processing recommendation" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
