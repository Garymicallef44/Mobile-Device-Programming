require("dotenv").config({ path: __dirname + "/.env" });


const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
app.use(express.json());
app.use(cors());


const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// PAYMENT INTENT (PaymentSheet)

app.post("/create-payment-intent", async(req, res) => {
    try {
        const { price } = req.body;
        const priceNumber = Number(price);

        if (!Number.isFinite(priceNumber)) {
            return res.status(400).json({ error: "Invalid price" });
        }

        const amount = Math.round(priceNumber * 100); // cents

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "eur",
        });

        res.json({ clientSecret: paymentIntent.client_secret });

    } catch (err) {
        console.log("PaymentIntent error:", err);
        res.status(500).json({ error: "Failed to create PaymentIntent" });
    }
});


// Checkout Page
app.post("/create-checkout-session", async(req, res) => {
    try {
        const { serviceName, amount } = req.body;

        console.log("Checkout request:", req.body);

        if (!serviceName || !amount) {
            return res.status(400).json({ error: "Missing serviceName or amount" });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "eur",
                    product_data: { name: serviceName },
                    unit_amount: amount,
                },
                quantity: 1,
            }, ],
            success_url: "https://example.com/success",
            cancel_url: "https://example.com/cancel",
        });

        res.json({ url: session.url });

    } catch (err) {
        console.log("Checkout Session error:", err);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});



app.listen(3000, () => {
    console.log("🚀 Backend running on http://localhost:3000");
});