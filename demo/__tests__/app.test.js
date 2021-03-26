const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
jest.mock('../lib/utils/twilio');
const twilio = require('../lib/utils/twilio');

jest.mock('twilio', () => () => ({
  messages: {
    create: jest.fn(),
  },
}));

describe('order tests', () => {
  beforeEach(() => {
    return setup(pool);
  });

  beforeEach(async () => {
    await request(app).post('/api/v1/orders').send({ quantity: 10 });

    twilio.sendSms.mockClear();
  });

  it('should create an order in database', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ quantity: 10 });

    expect(res.body).toEqual({ id: '2', quantity: 10 });
  });

  it('should get all orders from database', async () => {
    await request(app).post('/api/v1/orders').send({ quantity: 10 });

    const res = await request(app).get('/api/v1/orders');

    expect(res.body).toEqual([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 10 },
    ]);
  });

  it('should get a single order from database', async () => {
    const res = await request(app).get('/api/v1/orders/1');

    expect(res.body).toEqual({ id: '1', quantity: 10 });
  });

  it('should modify a single order', async () => {
    const res = await request(app)
      .put('/api/v1/orders/1')
      .send({ id: '1', quantity: 1 });

    expect(res.body).toEqual({ id: '1', quantity: 1 });
  });

  it('should send sms when order is modified', async () => {
    await request(app).put('/api/v1/orders/1').send({ quantity: 1 });

    expect(twilio.sendSms).toHaveBeenCalledTimes(1);
  });
});
