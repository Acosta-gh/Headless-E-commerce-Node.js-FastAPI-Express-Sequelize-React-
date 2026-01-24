const subscriberService = require('@/services/subscriber.service');


async function createSubscriber(req, res) {
  console.log("Creating subscriber with data:", req.body);
  try {
    const subscriber = await subscriberService.registerSubscriber(req.body);
    return res.status(201).json(subscriber);
  } catch (error) {
    console.error("Error while creating subscriber:", error);
    return res.status(500).json({ error: error.message });
  }
}   

module.exports = {
  createSubscriber,
};