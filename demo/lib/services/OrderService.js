const Order = require('../models/Order');
const { sendSms } = require('../utils/twilio');

module.exports = class OrderService {
  static async create({ quantity }) {
    await sendSms(
      process.env.ORDER_HANDLER_NUMBER,
      `New Order received for ${quantity}`
    );

    const order = await Order.insert({ quantity });

    return order;
  }

  static async getAll() {
    const orders = await Order.selectAll();
    return orders;
  }

  static async getById(id) {
    const order = await Order.selectById(id);
    return order;
  }

  static async update(id, { quantity }) {
    const order = await Order.update({ id, quantity });

    await sendSms(
      process.env.ORDER_HANDLER_NUMBER,
      `Order ${id} updated to ${quantity}`
    );

    return order;
  }

  static async delete(id) {
    const order = await Order.delete(id);

    await sendSms(process.env.ORDER_HANDLER_NUMBER, `Order ${id} was deleted`);

    return order;
  }
};
