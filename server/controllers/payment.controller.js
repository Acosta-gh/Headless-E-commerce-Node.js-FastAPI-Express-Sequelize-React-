const paymentService = require('@/services/payment.service');

async function getAvailablePaymentMethods(req, res) {
    try {
        const result = await paymentService.getAvailablePaymentMethods();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function createPaymentMethod(req, res) {
    try {
        const result = await paymentService.createPaymentMethod(req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

module.exports = {
    getAvailablePaymentMethods, createPaymentMethod,
};