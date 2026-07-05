const chatService = require("../services/chatService");
const ragService = require("../services/ragService");

const handleChat = async (req, res) => {
    try {
        const { history, message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, reply: "Tin nhắn không được để trống" });
        }

        const result = await chatService.processChatMessage(history, message);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Chat Controller Error:", error);
        return res.status(500).json({ success: false, reply: "Đã có lỗi xảy ra từ máy chủ." });
    }
};

const syncProducts = async (req, res) => {
    try {
        // You might want to add authentication here to prevent public access
        const result = await ragService.syncProductsToVectorDB();
        
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    } catch (error) {
        console.error("Sync Controller Error:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi đồng bộ." });
    }
};

module.exports = {
    handleChat,
    syncProducts
};
