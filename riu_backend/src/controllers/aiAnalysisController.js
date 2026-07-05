const aiAnalysisService = require("../services/aiAnalysisService");

const getBehavioralAnalysis = async (req, res) => {
  try {
    const forceGenerate = req.query.generate === 'true';
    const result = await aiAnalysisService.getBehavioralAnalysis(forceGenerate);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCustomerBehaviorAnalysis = async (req, res) => {
  try {
    const forceGenerate = req.query.generate === 'true';
    const result = await aiAnalysisService.getCustomerBehaviorAnalysisAI(forceGenerate);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(503).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBehavioralAnalysis,
  getCustomerBehaviorAnalysis
};
