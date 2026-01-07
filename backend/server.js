require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
app.use(cors());

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ Missing STRIPE_WEBHOOK_SECRET in .env");
      return res.status(500).send("Webhook secret not configured");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Event verified by Stripe signature
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("✅ payment_intent.succeeded:", paymentIntent.id);

        // TODO: mark order as PAID in your DB
        // Use paymentIntent.id or paymentIntent.metadata to find your order.
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("❌ payment_intent.payment_failed:", paymentIntent.id);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("✅ checkout.session.completed:", session.id);

        // TODO: mark order as PAID in your DB
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return res.json({ received: true });
  }
);


app.use(express.json());


// health check
app.get("/", (req, res) => res.json({ ok: true }));

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { price } = req.body;
    const priceNumber = Number(price);

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return res.status(400).json({ error: "Invalid price" });
    }

    const amount = Math.round(priceNumber * 100); // cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.log("PaymentIntent error:", err);
    res.status(500).json({ error: "Failed to create PaymentIntent" });
  }
});

// Web checkout
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { serviceName, amount } = req.body;

    console.log("Checkout request:", req.body);

    if (!serviceName || !amount) {
      return res.status(400).json({ error: "Missing serviceName or amount" });
    }

    const unitAmount = Number(amount);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: serviceName },
            unit_amount: unitAmount, // MUST be in cents already
          },
          quantity: 1,
        },
      ],
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.log("Checkout Session error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
