const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../models");
const {
    Category,
    Brand,
    ProductDescription,
    ProductSpec,
    Tag,
    ProductVariant,
    ProductVariantImage,
    AttributeValue,
    Attribute,
    Inventory
} = db;

const ragService = require("./ragService");
const { Op } = require("sequelize");

const getProductContextByIds = async (productIds) => {
    if (!productIds || productIds.length === 0) return "Không tìm thấy sản phẩm phù hợp cụ thể nào, hãy tư vấn chung dựa trên kiến thức của bạn.";

    try {
        const products = await db.Product.findAll({
            where: { 
                id: { [Op.in]: productIds },
                status: 'active' 
            },
            include: [
                { model: Category, attributes: ["id", "name", "slug"] },
                { model: Brand, attributes: ["id", "name", "slug"] },
                { model: ProductSpec, attributes: ["label", "value"] },
                {
                    model: ProductVariant,
                    attributes: ["id", "price"],
                },
            ],
            attributes: ['id', 'name', 'slug', 'warranty_months']
        });

        let contextString = "Danh sách sản phẩm phù hợp nhất với yêu cầu của khách hàng (ID, Tên, Link, Giá, Bảo hành, Cấu hình):\n";

        products.forEach(p => {
            let lowestPrice = Infinity;
            if (p.ProductVariants && p.ProductVariants.length > 0) {
                p.ProductVariants.forEach(v => {
                    const price = parseFloat(v.price);
                    if (price < lowestPrice) lowestPrice = price;
                });
            }
            if (lowestPrice === Infinity) lowestPrice = "Liên hệ";
            else lowestPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lowestPrice);

            const link = `${process.env.FRONTEND_URL}/product/${p.slug}`;

            let specsStr = "";
            if (p.ProductSpecs && p.ProductSpecs.length > 0) {
                specsStr = " | Cấu hình: " + p.ProductSpecs.slice(0, 5).map(s => `${s.label}: ${s.value}`).join(', ');
            }

            const warrantyStr = p.warranty_months ? ` | Bảo hành: ${p.warranty_months} tháng` : "";
            contextString += `- ID: ${p.id} | Tên: ${p.name} | Giá từ: ${lowestPrice} | Link: ${link}${warrantyStr}${specsStr}\n`;
        });

        return contextString;
    } catch (e) {
        console.error("Error fetching product context by IDs:", e);
        return "Hiện tại không lấy được chi tiết sản phẩm.";
    }
};

const processChatMessage = async (history, message) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 1. Dùng Vector RAG để tìm các ID sản phẩm liên quan nhất đến câu hỏi
        let productsContext = "";
        try {
            const matchedIds = await ragService.searchSimilarProducts(message, 5);
            if (matchedIds && matchedIds.length > 0) {
                // 2. Lấy thông tin chi tiết của các sản phẩm đó từ DB
                productsContext = await getProductContextByIds(matchedIds);
            } else {
                productsContext = "Hiện tại không tìm thấy sản phẩm cụ thể trong CSDL (hoặc Pinecone chưa được cấu hình). Hệ thống chưa đồng bộ Vector RAG.";
            }
        } catch (ragError) {
            console.error("RAG Search Error:", ragError);
            productsContext = "Lỗi khi tìm kiếm vector, hãy tư vấn chung chung.";
        }

        const systemPrompt = `Bạn là một nhân viên tư vấn bán hàng nhiệt tình, chuyên nghiệp của cửa hàng công nghệ RIUStore.
Nhiệm vụ của bạn là trả lời các câu hỏi của khách hàng, đặc biệt là tư vấn sản phẩm dựa trên nhu cầu và ngân sách của họ.
Bạn phải ĐƯA RA LINK (đường dẫn) đến sản phẩm để khách hàng có thể bấm vào mua ngay. Định dạng link dưới dạng markdown: [Tên sản phẩm](Link).
Luôn luôn lịch sự, xưng hô là "mình" hoặc "RIUStore" và gọi khách là "bạn".

Dưới đây là thông tin các sản phẩm PHÙ HỢP NHẤT được hệ thống tự động trích xuất dựa trên câu hỏi của khách:
---
${productsContext}
---
Nếu khách hàng hỏi về một sản phẩm không có trong danh sách trích xuất bên trên, hãy nói khéo léo rằng hiện tại cửa hàng chưa có hoặc đã hết hàng mẫu đó, và ưu tiên gợi ý các mẫu trong danh sách được cung cấp.
Hãy trả lời ngắn gọn, súc tích và dễ đọc. Dùng bullet points nếu cần.`;

        const formattedHistory = [];
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                if (msg.role && msg.content) {
                    formattedHistory.push({
                        role: msg.role === "user" ? "user" : "model",
                        parts: [{ text: msg.content }]
                    });
                }
            });
        }

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Hãy đọc kỹ hướng dẫn sau: " + systemPrompt }]
                },
                {
                    role: "model",
                    parts: [{ text: "Đã rõ. Tôi sẽ là nhân viên tư vấn bán hàng của RIUStore, tư vấn ưu tiên dựa trên danh sách sản phẩm trích xuất (RAG) được cung cấp và kèm link cho khách." }]
                },
                ...formattedHistory
            ]
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return {
            success: true,
            reply: responseText
        };
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return {
            success: false,
            reply: "Xin lỗi bạn, hiện tại hệ thống tư vấn đang gặp chút sự cố. Bạn vui lòng thử lại sau ít phút nhé!"
        };
    }
};

module.exports = {
    processChatMessage
};
