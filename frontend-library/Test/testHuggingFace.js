const { HfInference } = require("@huggingface/inference");

const hf = new HfInference("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");
const model = "sentence-transformers/paraphrase-MiniLM-L6-v2"; // Example model

async function testEmbedding() {
    try {
        const response = await hf.featureExtraction({
            model,
            inputs: "Test sentence for embedding",
        });
        console.log("Embedding loaded successfully:", response);
    } catch (error) {
        console.error("Error loading Hugging Face model or inference:", error);
    }
}

testEmbedding();
