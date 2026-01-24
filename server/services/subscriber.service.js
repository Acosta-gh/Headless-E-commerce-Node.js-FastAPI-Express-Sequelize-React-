const crypto = require("crypto");

const { Subscriber, Token } = require("@/models/index");

const {
  verifySubscriberEmail,
} = require("@/utils/templates/verifySubscriberEmail");
const { sendEmail } = require("@/utils/emailUtils");

const registerSubscriber = async (data) => {
  try {
    const existingSubscriber = await Subscriber.findOne({
      where: { email: data.email },
    });

    if (existingSubscriber) {
      throw new Error("Email already in use");
    }

    const subscriber = await Subscriber.create({
      ...data,
      verified: false,
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    await Token.create({
      subscriberId: subscriber.id,
      tokenHash,
      type: "email_verify",
      used: false,
    });

    const verificationLink = `${process.env.FRONTEND_URL}#/subscriber?token=${verificationToken}`;
    console.log("Link de verificación:", verificationLink);

    const html = verifySubscriberEmail(verificationLink);
    await sendEmail(subscriber.email, "Verify your email", html);

    return { subscriber };
  } catch (error) {
    console.error("Error creating subscriber:", error);
    throw new Error("Error creating subscriber: " + error.message);
  }
};

module.exports = {
  registerSubscriber,
};
