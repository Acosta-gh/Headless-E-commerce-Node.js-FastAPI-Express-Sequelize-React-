const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const PaymentMethod = sequelize.define(
    "PaymentMethod",
    {
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            // 'mercadopago', 'cash', 'bank_transfer'
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            // 'Mercado Pago', 'Efectivo', 'Transferencia Bancaria'
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        discountPercentage: {
            // Descuento a aplicar (ej: 10 = 10% off)
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100,
            },
        },
        surchargePercentage: {
            // Recargo a aplicar (ej: MercadoPago cobra comisión)
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100,
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        timestamps: true,
        tableName: "payment_methods",
    }
);

module.exports = { PaymentMethod };