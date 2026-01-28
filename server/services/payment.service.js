const { PaymentMethod } = require("@/models");

const getAvailablePaymentMethods = async () => {
    try {
        const methods = await PaymentMethod.findAll({
            where: { enabled: true },
            attributes: [
                'id',
                'code',
                'name',
                'description',
                'discountPercentage',
                'surchargePercentage',
                'icon'
            ],
            order: [['displayOrder', 'ASC']],
        });

        return methods;
    } catch (error) {
        throw new Error(`Error getting payment methods: ${error.message}`);
    }
};

const createPaymentMethod = async (data) => {
    try {
        const result = await PaymentMethod.create(data);
        return result;
    } catch (error) {
        throw new Error(`Error creating payment method: ${error.message}`);
    }
}
module.exports = {
    getAvailablePaymentMethods,
    createPaymentMethod
};