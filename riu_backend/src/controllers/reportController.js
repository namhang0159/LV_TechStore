const { getDashboardReportService } = require("../services/reportService");

const getDashboardReport = async (req, res) => {
  try {
    const result = await getDashboardReportService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardReport,
};
