# **Stripe Integration Guide (Expo + React Native)**

This guide walks you through setting up Stripe payments in a new Expo application, including a simple backend using Node.js and Express.

---

## **Prerequisites**

### **Android Emulator Setup**

1. Open **Android Studio**.
2. Go to **Device Manager** → **Create Virtual Device**.
3. Select a device (e.g., **Pixel 7 Pro**).
4. Choose a system image that supports:

   * **Google Play Store**
   * **Google Play Intel x86_64**

![Android Emulator Setup](https://github.com/user-attachments/assets/7a5e7d4a-c33f-482a-8fa6-54959d0d1ffe)

---

## **Step 1: Create/Log into Stripe**

* Go to: **[https://dashboard.stripe.com/login](https://dashboard.stripe.com/login)**
* Skip questions and go to the **Sandbox** environment.
* You will return later for the **secret key**.

---

## **Step 2: Create a New Expo App**

```bash
npx create-expo-app <name-of-app>
```

---

## **Step 3: Enter the App Directory**

```bash
cd <name-of-app>
```

---

## **Step 4: Open the Project in Your IDE**

For VS Code:

```bash
code .
```

---

## **Step 5: Create Backend Folder + Server File**

1. In the **root directory**, create a folder named **backend**.
2. Inside it, create a file named **server.js**.
3. Paste the following code:

```javascript
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const stripe = Stripe("secret key"); //  Replace this with your real secret key!

app.post("/create-payment-intent", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000, // $10.00
    currency: "usd",
  });

  res.send({ clientSecret: paymentIntent.client_secret });
});

app.listen(4242, "0.0.0.0", () => {
  console.log("Backend running on http://localhost:4242");
});
```

### **⚠ IMPORTANT**

Get your secret key from **Stripe Dashboard → Developers → API keys** and replace:

```js
const stripe = Stripe("secret key");
```

---

## **Step 6: Install Stripe in Your Frontend**

```bash
npx expo install @stripe/stripe-react-native
```

---

## **Step 7: Setup Backend Dependencies**

```bash
cd backend
npm init -y
npm install express stripe cors
node server.js
```

Backend will run on: **[http://localhost:4242](http://localhost:4242)**

---

## **Step 8: Add Payment Code to Your App**

Open:

```
app/(tabs)/index.tsx
```

Paste this:

```tsx
import { useState } from "react";
import { View, Button, Pressable, Text } from "react-native";
import { initPaymentSheet, presentPaymentSheet } from "@stripe/stripe-react-native";

export default function HomeScreen() {
  const [ready, setReady] = useState(false);

  async function fetchClientSecret() {
    const res = await fetch("http://10.0.2.2:4242/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const { clientSecret } = await res.json();
    return clientSecret;
  }

  async function initializePaymentSheet() {
    const clientSecret = await fetchClientSecret();
    await initPaymentSheet({
      merchantDisplayName: "My App",
      paymentIntentClientSecret: clientSecret,
    });
    setReady(true);
  }

  async function openPaymentSheet() {
    await presentPaymentSheet();
  }

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <Button title="Setup Payment" onPress={initializePaymentSheet} />

      <View style={{ height: 20 }} />

      <Text style={{ color: "blue", fontSize: 20 }}>
        READY STATE: {ready ? "true" : "false"}
      </Text>

      <Pressable
        onPress={openPaymentSheet}
        disabled={!ready}
        style={{
          backgroundColor: ready ? "#007AFF" : "#999",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>Pay</Text>
      </Pressable>
    </View>
  );
}
```

---

## **Step 9: Run the App**

```bash
npx expo start
```

Press **A** to open Android emulator.

---

## **Step 10: Test the Payment**

1. Tap **Setup Payment**.
2. Tap **Pay**.
3. Enter any valid test card (e.g., `4242 4242 4242 4242`).
4. Submit the payment.

Check your Stripe Dashboard → **Payments** to see your new transaction.

---

