const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../models");
const sequelize = db.sequelize;
const customerService = require("./customerService");
const getBehavioralAnalysis = async (forceGenerate = false) => {
  try {
    if (!forceGenerate) {
      const existing = await db.AiAnalysis.findOne({ where: { analysis_type: 'behavioral' } });
      if (existing) {
        return { success: true, ...existing.analysis_data };
      }
    }
    // 1. Fetch Orders grouped by month for seasonality
    const [ordersData] = await sequelize.query(`
      SELECT 
        MONTH(created_at) as month, 
        YEAR(created_at) as year, 
        COUNT(id) as total_orders, 
        SUM(final_amount) as total_revenue 
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at) 
      ORDER BY year DESC, month DESC 
      LIMIT 12;
    `);

    // 2. Fetch top 10 products in wishlists
    const [wishlistData] = await sequelize.query(`
      SELECT 
        p.name as product_name, 
        COUNT(w.id) as favorited_count 
      FROM wishlists w 
      JOIN products p ON w.product_id = p.id 
      GROUP BY w.product_id, p.name 
      ORDER BY favorited_count DESC 
      LIMIT 10;
    `);

    // 3. Fetch top 10 products added to cart
    const [cartData] = await sequelize.query(`
      SELECT 
        p.name as product_name, 
        SUM(c.quantity) as added_to_cart_qty 
      FROM cart_items c 
      JOIN product_variants pv ON c.variant_id = pv.id 
      JOIN products p ON pv.product_id = p.id 
      GROUP BY pv.product_id, p.name 
      ORDER BY added_to_cart_qty DESC 
      LIMIT 10;
    `);

    const prompt = `
Bạn là một chuyên gia phân tích dữ liệu và chiến lược gia kinh doanh xuất sắc cho một cửa hàng thương mại điện tử chuyên bán đồ công nghệ (Tech Store).
Dựa vào dữ liệu hệ thống được cung cấp dưới đây, hãy phân tích và trả về kết quả ở định dạng JSON.

Cấu trúc JSON bắt buộc:
{
  "overview": "Giới thiệu chung về báo cáo phân tích, tóm tắt tình hình",
  "seasonality": {
    "insights": ["Nhận định 1", "Nhận định 2", "..."],
    "conclusion": "Kết luận về tính mùa vụ"
  },
  "customerPreferences": {
    "insights": ["Nhận định 1", "Nhận định 2", "..."],
    "conclusion": "Kết luận về sở thích khách hàng"
  },
  "marketEvaluation": {
    "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
    "weaknesses": ["Hạn chế 1", "Hạn chế 2"],
    "conclusion": "Kết luận thị trường"
  },
  "actionableSuggestions": {
    "promotions": [
      { "name": "Tên chương trình khuyến mãi", "objective": "Mục tiêu", "execution": "Cách thực hiện" }
    ],
    "inventory": [
      { "name": "Chiến lược kho", "action": "Hành động cụ thể", "details": "Chi tiết" }
    ],
    "marketing": [
      { "name": "Chiến lược Marketing", "strategy": "Chiến lược", "details": "Chi tiết" }
    ],
    "advice": "Lời khuyên cuối cùng cho Admin"
  }
}

### DỮ LIỆU HỆ THỐNG:
- Doanh thu & Đơn hàng 12 tháng gần nhất (Tháng/Năm - Tổng Đơn - Tổng Doanh Thu): 
${JSON.stringify(ordersData, null, 2)}

- Top 10 sản phẩm được yêu thích nhất (Wishlist): 
${JSON.stringify(wishlistData, null, 2)}

- Top 10 sản phẩm được thêm vào giỏ hàng nhiều nhất: 
${JSON.stringify(cartData, null, 2)}

Hãy viết báo cáo chuyên nghiệp, cung cấp những insights sâu sắc. Định dạng JSON phải hợp lệ.
    `;

    let text;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } catch (geminiError) {
      console.warn("Gemini API failed, using mock data...", geminiError.message);
      text = JSON.stringify({
        overview: "Hệ thống AI hiện tại đang quá tải hoặc hết tài nguyên (Lỗi API Key). Đây là dữ liệu phân tích giả lập (Mock Data) để đảm bảo hệ thống không bị gián đoạn.",
        seasonality: {
          insights: ["Nhu cầu mua sắm đồ công nghệ có dấu hiệu tăng vào các tháng cuối năm và đầu năm học mới.", "Một số tháng giữa năm doanh số có phần chậm lại."],
          conclusion: "Tính mùa vụ ảnh hưởng khá rõ rệt đến doanh thu của cửa hàng."
        },
        customerPreferences: {
          insights: ["Khách hàng có xu hướng quan tâm nhiều đến các dòng Laptop và thiết bị phụ kiện.", "Tỉ lệ chuyển đổi từ giỏ hàng sang thanh toán cần được cải thiện thêm."],
          conclusion: "Cần tập trung vào các sản phẩm được đưa vào Wishlist nhiều nhất để tung ra khuyến mãi phù hợp."
        },
        marketEvaluation: {
          strengths: ["Sản phẩm đa dạng, bắt kịp xu hướng thị trường.", "Có lượng khách hàng quan tâm đến các sản phẩm cao cấp."],
          weaknesses: ["Chưa tối ưu được tỉ lệ chốt đơn đối với các sản phẩm nằm trong giỏ hàng."],
          conclusion: "Cửa hàng đang có tiềm năng tốt nhưng cần tối ưu hóa phễu bán hàng."
        },
        actionableSuggestions: {
          promotions: [
            { name: "Flash Sale cuối tuần", objective: "Thúc đẩy các sản phẩm trong giỏ hàng", execution: "Gửi email/thông báo giảm giá 5-10% cho khách hàng chưa thanh toán." }
          ],
          inventory: [
            { name: "Nhập thêm hàng xu hướng", action: "Tăng số lượng tồn kho", details: "Đặc biệt là các mã đang hot." }
          ],
          marketing: [
            { name: "Remarketing giỏ hàng", strategy: "Chạy quảng cáo nhắm mục tiêu lại", details: "Hiển thị các sản phẩm khách đã thêm vào giỏ nhưng chưa mua." }
          ],
          advice: "Hãy tiếp tục theo dõi biến động thị trường và tập trung vào các nhóm khách hàng tiềm năng."
        }
      });
    }

    let analysisJson;
    try {
      const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      analysisJson = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON from AI", text);
      throw new Error("AI returned invalid JSON");
    }

    const resultData = {
      analysis: analysisJson,
      rawData: {
        ordersData,
        wishlistData,
        cartData
      }
    };

    const [record, created] = await db.AiAnalysis.findOrCreate({
      where: { analysis_type: 'behavioral' },
      defaults: { analysis_data: resultData }
    });
    
    if (!created) {
      record.analysis_data = resultData;
      await record.save();
    }

    return {
      success: true,
      ...resultData
    };
  } catch (error) {
    console.error("Error generating behavioral analysis:", error);
    throw new Error("Không thể phân tích dữ liệu lúc này: " + error.message);
  }
};

const getCustomerBehaviorAnalysisAI = async (forceGenerate = false) => {
  try {
    if (!forceGenerate) {
      const existing = await db.AiAnalysis.findOne({ where: { analysis_type: 'customer_behavior' } });
      if (existing) {
        return { success: true, ...existing.analysis_data };
      }
    }
    const clusteringResult = await customerService.getCustomerClusteringService();
    const clusters = clusteringResult.data.clusters;

    const summary = clusters.map(c => ({
      clusterName: c.name,
      customerCount: c.count,
      averageSpend: c.avgSpend,
      contributionPercentage: c.contributionPercentage,
      topProducts: c.topProductsArray.map(p => p.name),
      ageDistribution: c.ageDistribution
    }));

    const prompt = `
Bạn là một Senior Business Analyst và Data Consultant với hơn 15 năm kinh nghiệm trong lĩnh vực thương mại điện tử và bán lẻ công nghệ.
Bạn đang tư vấn trực tiếp cho CEO của một hệ thống bán đồ công nghệ.
Mục tiêu của bạn KHÔNG phải mô tả lại dữ liệu, mà phải phân tích sâu, tìm insight, phát hiện rủi ro, dự đoán xu hướng và đưa ra hành động kinh doanh cụ thể.

========================
DỮ LIỆU ĐẦU VÀO
========================
${JSON.stringify(summary, null, 2)}

========================
YÊU CẦU
========================
Hãy phân tích dữ liệu như một chuyên gia thực thụ.
KHÔNG được chỉ mô tả lại số liệu.
Ví dụ KHÔNG được viết:
- VIP có mức chi tiêu cao.
- Loyal mua nhiều.
- New ít mua.

Đây chỉ là mô tả. Thay vào đó hãy trả lời:
- Điều đó có ý nghĩa gì?
- Vì sao xảy ra?
- Ảnh hưởng tới doanh nghiệp như thế nào?
- Admin nên làm gì?

========================
PHÂN TÍCH BẮT BUỘC
========================
1. Executive Summary: Viết một đoạn tóm tắt ngắn như báo cáo gửi CEO.
2. Business Health Score: Đánh giá sức khỏe doanh nghiệp theo thang điểm 0-100 (Ví dụ: 90-100 Excellent, 75-89 Good, 60-74 Fair, <60 Warning).
3. Customer Segment Analysis: Với mỗi cluster hãy phân tích hành vi mua hàng, giá trị đối với doanh nghiệp, nguy cơ, cơ hội phát triển, chiến lược phù hợp.
4. Key Findings: Liệt kê các insight quan trọng nhất (VD: Doanh thu phụ thuộc quá nhiều vào nhóm VIP).
5. Risks: Phát hiện các rủi ro và giải thích hậu quả.
6. Opportunities: Đề xuất cơ hội tăng trưởng (Upsell, Cross-sell, v.v.).
7. Marketing Recommendations: Đề xuất tối thiểu 5 chiến dịch (bao gồm target, objective, execution, expectedImpact).
8. Priority Action Plan: Đưa ra danh sách hành động ưu tiên. Sắp xếp theo mức độ ưu tiên.
9. Predictions: Dự đoán trong thời gian tới (nhóm khách nào tăng/giảm, doanh thu, churn). Nếu dữ liệu không đủ hãy nói rõ. Không được bịa.
10. Final Recommendation: Đưa ra lời khuyên tổng thể cho CEO.

QUY TẮC: Không được bịa số liệu. Không suy luận vượt quá dữ liệu.

========================
JSON OUTPUT BẮT BUỘC
========================
{
  "executiveSummary": "",
  "businessHealth": {
    "score": 0,
    "level": "",
    "reasons": []
  },
  "customerSegments": [
    {
      "clusterName": "",
      "behavior": "",
      "businessValue": "",
      "risk": "",
      "opportunity": "",
      "strategy": ""
    }
  ],
  "keyFindings": [],
  "risks": [
    {
      "title": "",
      "description": "",
      "severity": ""
    }
  ],
  "opportunities": [
    {
      "title": "",
      "description": "",
      "expectedImpact": ""
    }
  ],
  "marketingRecommendations": [
    {
      "title": "",
      "targetCustomer": "",
      "objective": "",
      "execution": "",
      "expectedImpact": ""
    }
  ],
  "priorityActionPlan": [
    {
      "priority": 1,
      "title": "",
      "impact": "",
      "difficulty": "",
      "expectedResult": ""
    }
  ],
  "predictions": {
    "customerTrend": "",
    "revenueTrend": "",
    "churnRisk": "",
    "notes": ""
  },
  "finalRecommendation": ""
}
    `;

    let text;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } catch (geminiError) {
      console.warn("Gemini API failed, using mock data...", geminiError.message);
      text = JSON.stringify({
        executiveSummary: "Hệ thống AI hiện đang quá tải. Đây là dữ liệu giả lập để duy trì hoạt động và đảm bảo luồng phân tích không bị gián đoạn.",
        businessHealth: {
          score: 65,
          level: "Fair",
          reasons: ["Tỷ lệ giữ chân khách hàng mới chưa cao", "Doanh thu phụ thuộc vào một nhóm nhỏ VIP"]
        },
        customerSegments: [
          {
            clusterName: "VIP Customers (Mock)",
            behavior: "Mua sắm các sản phẩm cao cấp, ít nhạy cảm về giá nhưng yêu cầu dịch vụ hoàn hảo.",
            businessValue: "Mang lại nguồn doanh thu và dòng tiền lớn nhất cho cửa hàng.",
            risk: "Rủi ro sụt giảm doanh thu mạnh nếu nhóm này chuyển sang đối thủ.",
            opportunity: "Khai thác các gói bảo hành premium và sản phẩm độc quyền.",
            strategy: "Chăm sóc 1-1, tổ chức event tri ân riêng."
          },
          {
            clusterName: "Loyal Shoppers (Mock)",
            behavior: "Mua đều đặn các phụ kiện và thiết bị tầm trung.",
            businessValue: "Đóng vai trò nền tảng duy trì dòng tiền hàng tháng.",
            risk: "Dễ bị chèo kéo bởi các chương trình khuyến mãi sâu từ đối thủ.",
            opportunity: "Upsell lên các dòng sản phẩm cao cấp hơn.",
            strategy: "Triển khai thẻ thành viên tích điểm."
          }
        ],
        keyFindings: ["Chưa tối ưu được tệp khách hàng mới.", "Sự trung thành của khách hàng ở mức trung bình khá."],
        risks: [
          { title: "Churn Risk - Khách hàng mới", description: "Nguy cơ mất khách hàng sau lần mua đầu tiên rất cao.", severity: "High" }
        ],
        opportunities: [
          { title: "Tái kích hoạt khách hàng cũ", description: "Sử dụng voucher để kéo khách hàng đã ngủ đông quay lại.", expectedImpact: "Tăng 15% khách hàng quay lại" }
        ],
        marketingRecommendations: [
          { title: "Flash Sale VIP", targetCustomer: "VIP Customers", objective: "Thúc đẩy doanh số cuối tháng", execution: "Gửi SMS và Email cá nhân hóa", expectedImpact: "Tăng 30% doanh thu từ nhóm VIP" }
        ],
        priorityActionPlan: [
          { priority: 1, title: "Xây dựng hệ thống Automation CRM", impact: "High", difficulty: "Medium", expectedResult: "Quản lý khách tốt hơn, giảm 20% churn rate" }
        ],
        predictions: {
          customerTrend: "Khách hàng mới có thể chững lại do hết mùa tựu trường",
          revenueTrend: "Đi ngang trong quý tới",
          churnRisk: "Cao ở nhóm khách hàng phổ thông",
          notes: "Cần theo dõi sát sao chiến dịch marketing tháng tới."
        },
        finalRecommendation: "Nên tập trung tối ưu trải nghiệm chăm sóc sau mua thay vì chỉ đổ tiền vào quảng cáo tìm khách mới."
      });
    }

    let analysisJson;
    try {
      const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      analysisJson = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON from AI", text);
      throw new Error("AI returned invalid JSON");
    }

    const resultData = {
      data: analysisJson
    };

    const [record, created] = await db.AiAnalysis.findOrCreate({
      where: { analysis_type: 'customer_behavior' },
      defaults: { analysis_data: resultData }
    });
    
    if (!created) {
      record.analysis_data = resultData;
      await record.save();
    }

    return {
      success: true,
      ...resultData
    };
  } catch (error) {
    console.error("Error generating customer behavior analysis:", error);
    throw new Error("Không thể phân tích dữ liệu lúc này: " + error.message);
  }
};

module.exports = {
  getBehavioralAnalysis,
  getCustomerBehaviorAnalysisAI
};
