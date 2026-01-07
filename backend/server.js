require("dotenv").config({ path: ".env" });

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const firestore = require("firebase/firestore");
const fbConfig = require("../firebaseConfig.cjs");

const app = express();
app.use(cors());

// =======================
// Stripe initialization
// =======================
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// =======================
// Stripe Webhook
// ⚠️ MUST be BEFORE express.json()
// =======================
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

    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("✅ payment_intent.succeeded:", event.data.object.id);
        break;

      case "payment_intent.payment_failed":
        console.log("❌ payment_intent.payment_failed:", event.data.object.id);
        break;

      case "checkout.session.completed":
        console.log("✅ checkout.session.completed:", event.data.object.id);
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }

    res.json({ received: true });
  }
);

// =======================
// JSON middleware (AFTER webhook)
// =======================
app.use(express.json());

// =======================
// Health check
// =======================
app.get("/", (req, res) => res.json({ ok: true }));

// =======================
// Payment Intent (PaymentSheet)
// =======================
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

// =======================
// Stripe Checkout Session
// =======================
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { serviceName, amount } = req.body;

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
            unit_amount: unitAmount, // already in cents
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

// =======================
// Send Notification (Expo)
// =======================
app.post("/send-notif", async (req, res) => {
  try {
    const { id, title, msg } = req.body;

    const devices = firestore.collection(fbConfig.db, "devices");
    const q = firestore.query(
      devices,
      firestore.where(firestore.documentId(), "==", id)
    );

    const docs = await firestore.getDocs(q);

    if (docs.empty) {
      return res
        .status(404)
        .json({ success: false, error: "No Device found" });
    }

    const token = docs.docs[0].get("token");

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify({
        to: token,
        sound: "default",
        title,
        body: msg,
      }),
    });

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error sending notification:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =======================
// Server start
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
