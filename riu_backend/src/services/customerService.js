const db = require("../models");

const getAllCustomersService = async () => {
  try {
    const customers = await db.User.findAll({
      attributes: { exclude: ['password'] }
    });
    return { success: true, data: customers };
  } catch (error) {
    throw new Error("Error fetching customers: " + error.message);
  }
};

const getCustomerByIdService = async (id) => {
  try {
    const customer = await db.User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: db.UserAddress },
        { 
          model: db.Order,
          include: [
            {
              model: db.OrderItem,
              include: [
                {
                  model: db.ProductVariant,
                  include: [{ model: db.Product }]
                }
              ]
            }
          ]
        },
        {
          model: db.Wishlist,
          include: [{ model: db.Product }]
        },
        {
          model: db.Cart,
          include: [
            {
              model: db.CartItem,
              include: [
                {
                  model: db.ProductVariant,
                  include: [{ model: db.Product }]
                }
              ]
            }
          ]
        }
      ]
    });
    if (!customer) throw new Error("Customer not found");
    return { success: true, data: customer };
  } catch (error) {
    throw new Error("Error fetching customer: " + error.message);
  }
};

const updateCustomerStatusService = async (id, status) => {
  try {
    const customer = await db.User.findByPk(id);
    if (!customer) throw new Error("Customer not found");
    
    customer.status = status;
    await customer.save();
    
    return { success: true, message: "Customer status updated successfully", data: customer };
  } catch (error) {
    throw new Error("Error updating customer status: " + error.message);
  }
};

const getCustomerClusteringService = async () => {
  try {
    const customers = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'created_at', 'birth_date'],
      include: [
        { 
          model: db.Order,
          attributes: ['id', 'final_amount', 'created_at', 'order_status'],
          where: {
            order_status: ['Completed', 'Delivered']
          },
          required: false,
          include: [
            {
              model: db.OrderItem,
              attributes: ['product_name_snapshot', 'quantity']
            }
          ]
        }
      ]
    });

    const now = new Date();
    let totalRevenue = 0;
    let totalCustomersWithOrders = 0;
    
    // Calculate R, F, M for each customer
    const rfmData = customers.map(customer => {
      let r = null;
      let f = 0;
      let m = 0;
      let purchasedProducts = [];
      let age = null;

      if (customer.birth_date) {
        const diffMs = now - new Date(customer.birth_date);
        const ageDate = new Date(diffMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }
      
      let purchaseFrequency = null;
      let riskScore = "Low";
      let nextPurchasePrediction = null;

      if (customer.Orders && customer.Orders.length > 0) {
        f = customer.Orders.length;
        totalCustomersWithOrders++;
        
        customer.Orders.forEach(order => {
          m += parseFloat(order.final_amount || 0);
          if (order.OrderItems && order.OrderItems.length > 0) {
            order.OrderItems.forEach(item => {
              purchasedProducts.push({
                name: item.product_name_snapshot,
                quantity: item.quantity
              });
            });
          }
        });
        
        const sortedDates = customer.Orders.map(o => new Date(o.created_at)).sort((a, b) => a - b);
        const latestOrderDate = sortedDates[sortedDates.length - 1];
        const firstOrderDate = sortedDates[0];

        const diffTime = Math.abs(now - latestOrderDate);
        r = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (f > 1) {
          const totalDaysBetweenFirstAndLast = Math.ceil(Math.abs(latestOrderDate - firstOrderDate) / (1000 * 60 * 60 * 24));
          purchaseFrequency = Math.ceil(totalDaysBetweenFirstAndLast / (f - 1));
        }

        if (r > 180) riskScore = "High";
        else if (r > 90) riskScore = "Medium";
        else riskScore = "Low";

        if (purchaseFrequency) {
          const daysUntilNext = purchaseFrequency - r;
          if (daysUntilNext > 0) {
            nextPurchasePrediction = `Dự kiến mua sau ${daysUntilNext} ngày`;
          } else {
            nextPurchasePrediction = `Đã trễ ${Math.abs(daysUntilNext)} ngày so với chu kỳ`;
          }
        }
      } else {
        riskScore = "High"; // No orders -> High Risk of churning completely
      }
      
      totalRevenue += m;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        created_at: customer.created_at,
        age,
        r,
        f,
        m,
        purchasedProducts,
        riskScore,
        purchaseFrequency,
        nextPurchasePrediction
      };
    });

    const activeCustomers = rfmData.filter(c => c.f > 0);
    const sortBy = (arr, key) => [...arr].sort((a, b) => a[key] - b[key]);
    
    const rVals = sortBy(activeCustomers, 'r').map(c => c.r);
    const fVals = sortBy(activeCustomers, 'f').map(c => c.f);
    const mVals = sortBy(activeCustomers, 'm').map(c => c.m);

    const getQuartile = (val, sortedVals, reverse = false) => {
      if (sortedVals.length === 0) return 1;
      const q1 = sortedVals[Math.floor(sortedVals.length * 0.25)];
      const q2 = sortedVals[Math.floor(sortedVals.length * 0.5)];
      const q3 = sortedVals[Math.floor(sortedVals.length * 0.75)];
      
      let score = 1;
      if (val <= q1) score = 1;
      else if (val <= q2) score = 2;
      else if (val <= q3) score = 3;
      else score = 4;
      
      if (reverse) {
        score = 5 - score;
      }
      return score;
    };

    rfmData.forEach(customer => {
      if (customer.f === 0) {
        customer.rScore = 1;
        customer.fScore = 1;
        customer.mScore = 1;
        customer.cluster = "New/At-Risk";
        return;
      }
      
      customer.rScore = getQuartile(customer.r, rVals, true);
      customer.fScore = getQuartile(customer.f, fVals, false);
      customer.mScore = getQuartile(customer.m, mVals, false);
      
      const { rScore, fScore, mScore } = customer;
      
      if (rScore >= 3 && fScore >= 3 && mScore >= 3) {
        customer.cluster = "VIP Customers";
      } else if (fScore >= 3) {
        customer.cluster = "Loyal Shoppers";
      } else if (fScore <= 2 && mScore >= 3) {
        customer.cluster = "Impulse Buyers";
      } else {
        customer.cluster = "New/At-Risk";
      }
    });

    const clusters = [
      { name: 'VIP Customers', count: 0, spend: 0, users: [], ageDistribution: { '0-18': 0, '19-30': 0, '31-40': 0, '40+': 0, 'Unknown': 0 }, topProducts: {} },
      { name: 'Loyal Shoppers', count: 0, spend: 0, users: [], ageDistribution: { '0-18': 0, '19-30': 0, '31-40': 0, '40+': 0, 'Unknown': 0 }, topProducts: {} },
      { name: 'Impulse Buyers', count: 0, spend: 0, users: [], ageDistribution: { '0-18': 0, '19-30': 0, '31-40': 0, '40+': 0, 'Unknown': 0 }, topProducts: {} },
      { name: 'New/At-Risk', count: 0, spend: 0, users: [], ageDistribution: { '0-18': 0, '19-30': 0, '31-40': 0, '40+': 0, 'Unknown': 0 }, topProducts: {} },
    ];

    let multiOrderCustomers = 0;

    rfmData.forEach(c => {
      if (c.f > 1) multiOrderCustomers++;

      const cluster = clusters.find(cl => cl.name === c.cluster);
      if (cluster) {
        cluster.count += 1;
        cluster.spend += c.m;
        
        cluster.users.push({
          id: c.id,
          name: c.name,
          clv: c.m,
          orders: c.f,
          riskScore: c.riskScore,
          purchaseFrequency: c.purchaseFrequency,
          nextPurchasePrediction: c.nextPurchasePrediction
        });

        // Age distribution
        if (c.age === null) cluster.ageDistribution['Unknown']++;
        else if (c.age <= 18) cluster.ageDistribution['0-18']++;
        else if (c.age <= 30) cluster.ageDistribution['19-30']++;
        else if (c.age <= 40) cluster.ageDistribution['31-40']++;
        else cluster.ageDistribution['40+']++;

        // Products
        c.purchasedProducts.forEach(p => {
          if (!cluster.topProducts[p.name]) {
            cluster.topProducts[p.name] = 0;
          }
          cluster.topProducts[p.name] += p.quantity;
        });
      }
    });

    clusters.forEach(c => {
      c.avgSpend = c.count > 0 ? (c.spend / c.count).toFixed(2) : "0.00";
      c.contributionPercentage = totalRevenue > 0 ? ((c.spend / totalRevenue) * 100).toFixed(2) : "0.00";
      
      c.topProductsArray = Object.keys(c.topProducts)
        .map(name => ({ name, quantity: c.topProducts[name] }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); 
      
      c.users.sort((a, b) => b.clv - a.clv);
      c.users = c.users.slice(0, 10); // Only keep top 10 users to prevent massive payload
    });

    const retentionRate = customers.length > 0 ? ((multiOrderCustomers / customers.length) * 100).toFixed(2) : "0.00";

    return { 
      success: true, 
      data: { 
        overview: {
          totalCustomers: customers.length,
          retentionRate,
          totalRevenue,
          multiOrderCustomers
        },
        clusters, 
        rfmData: rfmData.map(c => ({r: c.r, f: c.f, m: c.m, cluster: c.cluster}))
      } 
    };
  } catch (error) {
    throw new Error("Error clustering customers: " + error.message);
  }
};

module.exports = {
  getAllCustomersService,
  getCustomerByIdService,
  updateCustomerStatusService,
  getCustomerClusteringService
};
