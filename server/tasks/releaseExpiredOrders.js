/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/
const cron = require("node-cron");
const { Op } = require("sequelize");
const { Image, Order, OrderItem, Article } = require("@/models/index");
const { deleteImageById } = require("@/services/image.service");
const { sequelize } = require("@/database/sequelize");

// ============================================================================
// 🖼️ Cleanup orphaned images
// ============================================================================
// Schedule a task to run monthly to clean up orphaned images
// Runs at 3:00 AM on the 1st of every month
cron.schedule("0 3 1 * *", async () => {
    //cron.schedule('* * * * *', async () => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        //const tenSecondsAgo = new Date(Date.now() - 10 * 1000);

        const imagesToDelete = await Image.findAll({
            where: {
                articleId: null,
                createdAt: {
                    [Op.lt]: twentyFourHoursAgo,
                    //[Op.lt]: tenSecondsAgo,
                },
            },
        });

        if (imagesToDelete.length > 0) {
            console.log(`Deleting ${imagesToDelete.length} orphaned images...`);
            for (const img of imagesToDelete) {
                try {
                    await deleteImageById(img.id);
                    console.log(`Image ${img.id} deleted successfully.`);
                } catch (err) {
                    console.error(`Error deleting image ${img.id}:`, err);
                }
            }
        } else {
            console.log("No orphaned images to delete.");
        }
    } catch (error) {
        console.error("Error cleaning up orphaned images:", error);
    }
});

// ============================================================================
// 📦 Release stock from expired unpaid orders
// ============================================================================
// Schedule a task to run every hour to release stock from expired orders
// Runs at minute 0 of every hour
cron.schedule("0 * * * *", async () => {
    //cron.schedule('*/30 * * * * *', async () => { // For testing: every 30 seconds
    const transaction = await sequelize.transaction();

    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        //const thirtySecondsAgo = new Date(Date.now() - 30 * 1000); // For testing

        // Find expired orders that are still pending or unpaid
        const expiredOrders = await Order.findAll({
            where: {
                paymentStatus: {
                    [Op.in]: ['pending', 'unpaid']
                },
                orderStatus: {
                    [Op.ne]: 'cancelled' // Not already cancelled
                },
                createdAt: {
                    [Op.lt]: twentyFourHoursAgo,
                    //[Op.lt]: thirtySecondsAgo,
                }
            },
            include: [{
                model: OrderItem,
                as: "items",
                attributes: ['productId', 'quantity', 'title']
            }],
            transaction,
        });

        if (expiredOrders.length > 0) {
            console.log(`🕐 Found ${expiredOrders.length} expired orders. Releasing stock...`);

            let totalItemsRestored = 0;

            for (const order of expiredOrders) {
                try {
                    // Return stock for each item in the order
                    for (const item of order.items) {
                        await Article.increment('stock', {
                            by: item.quantity,
                            where: { id: item.productId },
                            transaction
                        });

                        totalItemsRestored++;
                        console.log(`  📦 Restored ${item.quantity}x "${item.title}" (Product ID: ${item.productId})`);
                    }

                    // Mark order as cancelled and failed
                    await order.update({
                        paymentStatus: 'failed',
                        orderStatus: 'cancelled'
                    }, { transaction });

                    console.log(`  ✅ Order #${order.id} cancelled (${order.items.length} items restored)`);

                } catch (orderError) {
                    console.error(`  ❌ Error processing order #${order.id}:`, orderError.message);
                    // Continue with next order even if one fails
                }
            }

            await transaction.commit();

            console.log(`✅ Cleanup complete: ${expiredOrders.length} orders cancelled, ${totalItemsRestored} items restored to stock`);

        } else {
            await transaction.rollback();
            console.log("✅ No expired orders to process.");
        }

    } catch (error) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        console.error("❌ Error releasing expired orders:", error);
    }
});

console.log("✅ Scheduled tasks initialized:");
console.log("  - Orphaned images cleanup: 3:00 AM on 1st of every month");
console.log("  - Expired orders cleanup: Every hour at :00");
