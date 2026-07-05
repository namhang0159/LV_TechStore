const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../models");
const { Category, Brand, ProductDescription, ProductSpec, Tag, ProductVariant, ProductVariantImage, AttributeValue, Attribute, Inventory } = db;

// Initialize Pinecone
let pc;
let index;
const initPinecone = () => {
    if (pc && index) return;
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_HOST) {
        console.warn("Pinecone API key or Index Host is missing in .env. RAG features will not work.");
        return;
    }
    pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    });
    index = pc.index({ host: process.env.PINECONE_INDEX_HOST });
};

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

// Function to generate embedding for a text
const generateEmbedding = async (text) => {
    try {
        const result = await embeddingModel.embedContent({
            content: { parts: [{ text }] },
            outputDimensionality: 768
        });
        return result.embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};

// Helper function to format product into a searchable text block
const formatProductForEmbedding = (p) => {
    let lowestPrice = Infinity;
    if (p.ProductVariants && p.ProductVariants.length > 0) {
        p.ProductVariants.forEach(v => {
            const price = parseFloat(v.price);
            if (price < lowestPrice) lowestPrice = price;
        });
    }
    const priceStr = lowestPrice === Infinity ? "Liên hệ" : lowestPrice.toString();

    let specsStr = "";
    if (p.ProductSpecs && p.ProductSpecs.length > 0) {
        specsStr = p.ProductSpecs.map(s => `${s.label}: ${s.value}`).join(', ');
    }
    
    let tagsStr = "";
    if (p.Tags && p.Tags.length > 0) {
        tagsStr = p.Tags.map(t => t.name).join(', ');
    }

    const brandStr = p.Brand ? p.Brand.name : "";
    const categoryStr = p.Category ? p.Category.name : "";

    // The text to embed should contain all relevant searchable info
    return `Tên sản phẩm: ${p.name}. 
Thương hiệu: ${brandStr}. 
Danh mục: ${categoryStr}. 
Giá từ: ${priceStr} VNĐ. 
Cấu hình/Thông số: ${specsStr}. 
Từ khóa: ${tagsStr}.`;
};

// Fetch all active products and sync them to Pinecone
const syncProductsToVectorDB = async () => {
    initPinecone();
    if (!index) return { success: false, message: "Pinecone not configured" };

    try {
        const products = await db.Product.findAll({
            where: { status: 'active' },
            include: [
                { model: Category, attributes: ["name"] },
                { model: Brand, attributes: ["name"] },
                { model: ProductSpec, attributes: ["label", "value"] },
                { model: Tag, attributes: ["name"], through: { attributes: [] } },
                { model: ProductVariant, attributes: ["price"] }
            ]
        });

        console.log(`Found ${products.length} active products to sync...`);
        const vectors = [];

        for (const p of products) {
            const textToEmbed = formatProductForEmbedding(p);
            const vectorValues = await generateEmbedding(textToEmbed);
            
            vectors.push({
                id: p.id.toString(), // Pinecone requires string IDs
                values: vectorValues,
                metadata: {
                    name: p.name,
                    slug: p.slug
                }
            });

            // Pinecone recommends upserting in batches (e.g., 100 at a time)
            if (vectors.length >= 50) {
                await index.upsert({ records: vectors });
                vectors.length = 0; // Clear the array
                // Optional: delay slightly to avoid rate limits on Gemini free tier
                await new Promise(res => setTimeout(res, 500)); 
            }
        }

        // Upsert remaining
        if (vectors.length > 0) {
            await index.upsert({ records: vectors });
        }

        console.log("Sync complete!");
        return { success: true, message: `Synced ${products.length} products to Vector DB.` };
    } catch (error) {
        console.error("Error syncing to Vector DB:", error);
        return { success: false, message: "Error syncing data", error: error.message };
    }
};

// Search for top K most relevant products based on user query
const searchSimilarProducts = async (userQuery, topK = 5) => {
    initPinecone();
    if (!index) return []; // Fallback if Pinecone isn't setup

    try {
        const queryVector = await generateEmbedding(userQuery);
        
        const queryResponse = await index.query({
            vector: queryVector,
            topK: topK,
            includeMetadata: true
        });
        
        // Extract IDs of matching products
        const matchedIds = queryResponse.matches.map(match => parseInt(match.id));
        return matchedIds;
    } catch (error) {
        console.error("Error searching in Vector DB:", error);
        return [];
    }
};

module.exports = {
    syncProductsToVectorDB,
    searchSimilarProducts
};
