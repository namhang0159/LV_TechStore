const { Order, Product, User, OrderItem, sequelize } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

const getDashboardReportService = async () => {
  try {
    const now = moment();
    const startOfMonth = now.clone().startOf('month').toDate();
    const startOfPrevMonth = now.clone().subtract(1, 'month').startOf('month').toDate();
    const endOfPrevMonth = now.clone().subtract(1, 'month').endOf('month').toDate();

    // 1. KPI Cards
    const totalUsers = await User.count();
    const newUsersThisMonth = await User.count({
      where: { created_at: { [Op.gte]: startOfMonth } }
    });
    
    const usersPrevMonth = await User.count({
      where: { created_at: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] } }
    });
    const userGrowth = usersPrevMonth === 0 ? 100 : ((newUsersThisMonth - usersPrevMonth) / usersPrevMonth) * 100;

    // 2. Sales Goal & Revenue
    const revenueThisMonthResult = await Order.sum('final_amount', {
      where: {
        order_status: 'Completed',
        created_at: { [Op.gte]: startOfMonth }
      }
    });
    const soldFor = revenueThisMonthResult || 0;

    // 3. Average Order Value
    const ordersThisMonth = await Order.count({
      where: {
        order_status: 'Completed',
        created_at: { [Op.gte]: startOfMonth }
      }
    });
    const aovThisMonth = ordersThisMonth > 0 ? (soldFor / ordersThisMonth) : 0;
    
    const revenuePrevMonthResult = await Order.sum('final_amount', {
      where: {
        order_status: 'Completed',
        created_at: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] }
      }
    });
    const ordersPrevMonth = await Order.count({
      where: {
        order_status: 'Completed',
        created_at: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] }
      }
    });
    const aovPrevMonth = ordersPrevMonth > 0 ? (revenuePrevMonthResult / ordersPrevMonth) : 0;

    // 4. Top Customers
    const topCustomersRaw = await Order.findAll({
      attributes: [
        'user_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders_count'],
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'total_spent']
      ],
      where: { order_status: 'Completed' },
      group: ['user_id'],
      order: [[sequelize.col('total_spent'), 'DESC']],
      limit: 5,
      raw: true
    });
    
    const topCustomers = await Promise.all(topCustomersRaw.map(async (tc) => {
      const user = tc.user_id ? await User.findByPk(tc.user_id) : null;
      return {
        name: user ? user.name : 'Guest User',
        initial: user && user.name ? user.name.charAt(0).toUpperCase() : 'G',
        orders: tc.orders_count,
        spent: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tc.total_spent),
        bg: 'bg-blue-500' 
      };
    }));

    // 5. Top Products
    const topProductsRaw = await OrderItem.findAll({
      attributes: [
        'product_name_snapshot',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'units_sold']
      ],
      group: ['product_name_snapshot'],
      order: [[sequelize.col('units_sold'), 'DESC']],
      limit: 5,
      raw: true
    });

    const topProducts = topProductsRaw.map((tp, index) => {
       const colors = ['bg-orange-100', 'bg-slate-100', 'bg-slate-300', 'bg-slate-800', 'bg-red-500'];
       return {
         name: tp.product_name_snapshot || 'Unknown Product',
         clicks: 0, // No tracking data for clicks
         units: tp.units_sold,
         color: colors[index % colors.length]
       };
    });

    // 6. Customer Growth (Last 12 Months)
    const labels = [];
    const newCustomersArr = [];
    const returningCustomersArr = [];

    for (let i = 11; i >= 0; i--) {
      const startOfM = moment().subtract(i, 'months').startOf('month').toDate();
      const endOfM = moment().subtract(i, 'months').endOf('month').toDate();
      labels.push(moment().subtract(i, 'months').format('MMM'));

      const newC = await User.count({
        where: { created_at: { [Op.between]: [startOfM, endOfM] } }
      });
      newCustomersArr.push(newC);

      // Returning customers: ordered this month but created before this month
      const retC = await Order.count({
        distinct: true,
        col: 'user_id',
        where: {
          created_at: { [Op.between]: [startOfM, endOfM] }
        },
        include: [{
          model: User,
          as: 'User',
          where: { created_at: { [Op.lt]: startOfM } },
          required: true
        }]
      });
      returningCustomersArr.push(retC || 0); // Need to define association if not exist, will handle with manual query to avoid association errors

    }

    // Fix returning customers manual query in case associations aren't fully set up in Sequelize
    for (let i = 0; i < 12; i++) {
        const startOfM = moment().subtract(11 - i, 'months').startOf('month').format('YYYY-MM-DD HH:mm:ss');
        const endOfM = moment().subtract(11 - i, 'months').endOf('month').format('YYYY-MM-DD HH:mm:ss');
        
        try {
            const query = `
            SELECT COUNT(DISTINCT orders.user_id) as count
            FROM orders
            JOIN users ON orders.user_id = users.id
            WHERE orders.created_at BETWEEN '${startOfM}' AND '${endOfM}'
            AND users.created_at < '${startOfM}'
            `;
            const [results] = await sequelize.query(query);
            returningCustomersArr[i] = results[0].count;
        } catch (err) {
            returningCustomersArr[i] = 0;
        }
    }

    // 7. Demographics (Provinces)
    let customerDemographics = [];
    try {
        const queryDemo = `
            SELECT province as region, COUNT(id) as users 
            FROM user_addresses 
            WHERE province IS NOT NULL 
            GROUP BY province 
            ORDER BY users DESC 
            LIMIT 4
        `;
        const [demoResults] = await sequelize.query(queryDemo);
        const demoColors = ['bg-blue-600', 'bg-yellow-400', 'bg-orange-400', 'bg-slate-300'];
        customerDemographics = demoResults.map((r, i) => ({
            region: r.region,
            users: r.users,
            color: demoColors[i % demoColors.length]
        }));
    } catch(err) {}

    // 8. Age Distribution
    let ageDistribution = [];
    try {
        const usersForAge = await User.findAll({ attributes: ['birth_date'] });
        let group0_18 = 0;
        let group18_30 = 0;
        let group30_40 = 0;
        let groupOther = 0;
        let totalHasAge = 0;

        usersForAge.forEach(u => {
            if (u.birth_date) {
                const age = moment().diff(moment(u.birth_date), 'years');
                if (age <= 18) group0_18++;
                else if (age <= 30) group18_30++;
                else if (age <= 40) group30_40++;
                else groupOther++;
                totalHasAge++;
            }
        });

        if (totalHasAge > 0) {
            ageDistribution = [
                { ageGroup: '0-18 years', percentage: Math.round((group0_18/totalHasAge)*100), color: 'bg-blue-500' },
                { ageGroup: '18-30 years', percentage: Math.round((group18_30/totalHasAge)*100), color: 'bg-yellow-400' },
                { ageGroup: '30-40 years', percentage: Math.round((group30_40/totalHasAge)*100), color: 'bg-slate-300' },
                { ageGroup: 'Other', percentage: Math.round((groupOther/totalHasAge)*100), color: 'bg-emerald-500' }
            ];
        }
    } catch (err) {}

    return {
      success: true,
      data: {
        kpiCards: {
          existingUsers: { value: totalUsers, growth: 0 }, 
          newUsers: { value: newUsersThisMonth, growth: userGrowth.toFixed(2) },
          totalVisits: { value: 0, growth: 0 }, // No tracking data
          uniqueVisits: { value: 0, growth: 0 } // No tracking data
        },
        salesGoal: {
          soldFor: soldFor,
          monthlyGoal: 0, // No goals set up in database
          left: 0,
          percentage: 0
        },
        averageOrderValue: {
          thisMonth: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(aovThisMonth),
          previousMonth: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(aovPrevMonth)
        },
        topCustomers: topCustomers,
        topProducts: topProducts,
        customerGrowth: {
          labels: labels,
          returningCustomers: returningCustomersArr,
          newCustomers: newCustomersArr
        },
        customerDemographics: customerDemographics,
        ageDistribution: ageDistribution,
        
        // Return zeros/empty for things we physically cannot track without GA/events
        conversionRate: { cart: 0, checkout: 0, purchase: 0 },
        visitsByDevice: [],
        onlineSessions: 0,
        storeFunnel: { conversionRate: 0, increase: 0, steps: [] }
      }
    };
  } catch (error) {
    throw new Error("Lỗi khi lấy báo cáo: " + error.message);
  }
};

module.exports = {
  getDashboardReportService,
};
