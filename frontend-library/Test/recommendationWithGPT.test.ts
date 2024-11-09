import { generateEmbedding, cosineSimilarity, generateRecommendations } from "../service_side/recommendationModel";
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('generateEmbedding', () => {
    it('returns an embedding array for valid text', async () => {
        mockedAxios.post.mockResolvedValue({
            data: { data: [{ embedding: [0.1, 0.2, 0.3] }] }
        });

        const result = await generateEmbedding('sample text');
        expect(result).toEqual([0.1, 0.2, 0.3]);
    });

    it('handles errors and returns null', async () => {
        mockedAxios.post.mockRejectedValue(new Error('API error'));
        const result = await generateEmbedding('sample text');
        expect(result).toBeNull();
    });
});

describe('cosineSimilarity', () => {
    it('calculates the correct cosine similarity between two vectors', () => {
        const a = [1, 2, 3];
        const b = [4, 5, 6];
        const result = cosineSimilarity(a, b);
        expect(result).toBeCloseTo(0.9746, 4);
    });
});

describe('generateRecommendations', () => {
    it('generates recommendations based on user preferences', async () => {
        const sampleBooks = [
            { title: 'Book 1', authors: ['Author A'], genre: 'Fiction', embedding: [0.1, 0.2, 0.3] },
            { title: 'Book 2', authors: ['Author B'], genre: 'Science', embedding: [0.2, 0.3, 0.4] }
        ];
        const userPreferences = { favoriteGenres: ['Fiction'], favoriteAuthors: ['Author A'], favoriteBooks: [] };

        const recommendations = await generateRecommendations('Book 1', sampleBooks, [], userPreferences);
        expect(recommendations[0].title).toBe('Book 1');
    });
});