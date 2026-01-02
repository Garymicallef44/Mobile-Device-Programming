require("dotenv").config({ path: "./.env" });


const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const firestore = require("firebase/firestore");
const fbConfig = require("../firebaseConfig");

const app = express();
app.use(express.json());
app.use(cors());


const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// // PAYMENT INTENT (PaymentSheet)

app.post("/create-payment-intent", async(req, res) => {
    try {
        const { amount } = req.body;

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


// // Checkout Page
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

app.post("/send-notif",async(req,res)=>{
    const {id, title,msg} = req.body;
    const devices = firestore.collection(fbConfig.db,"devices");
    const q = firestore.query(devices,firestore.where("id","==",id));
    const docs = (await firestore.getDocs(q));
    if (docs.empty){
        return res.status(404).json({success:false, error: "No Device found"});
    }
    let token;
    
    token = docs.docs[0].get("token");
    
    try{
    
    const response = await fetch("https://exp.host/--/api/v2/push/send",{
      method:"POST",
      headers:{"Content-Type":"application/json",
        "Accept":"application/json",
        "Accept-Encoding":"gzip, deflate"
      },
      body: JSON.stringify({
        to:token,
        sound:"default",
        title:title,
        body:msg,
        
      }),
    });

    const data = await response.json();
    res.status(200).json({success:true, data});
  }catch(err){
    console.error("Error sending notification:",err);
    res.status(500).json({success:false, error:err.message});
  }
});

app.listen(3000, () => {
    console.log("🚀 Backend running on http://localhost:3000");
});