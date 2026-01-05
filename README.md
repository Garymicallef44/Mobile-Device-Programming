# Usability Study for Servify

## How to set up and run the app using android studio

Download the project folder from our github repository at  
https://github.com/Garymicallef44/Mobile-Device-Programming

Go to the project root directory and create a text file named `.env`, open it and paste these contents into it:

```env
EXPO_PUBLIC_FIREBASE_API_KEY="AIzaSyB-OYwubrmTaZThyaapsaBkME13fNRKD-c"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="servifyapp-9d5dc.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="servifyapp-9d5dc"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="servifyapp-9d5dc.firebasestorage.app"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="224238467474"
EXPO_PUBLIC_FIREBASE_APP_ID="1:224238467474:web:bc3d7ea71b313aaf93694b"
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID="G-SDL72MZVDP"
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51RiNqdDHQ8Epd27Sk57L3A1A5a2M5BUAMzEnxbe4sr9xS7pMt02J1QBCondaJZdVUDWr8flDlQjJbv7uKUsby1q400HCiwWgxz"
Once this is done, save and navigate to the backend folder in the root directory. Create another .env file and paste these contents into it:

STRIPE_SECRET_KEY="sk_test_51RiNqdDHQ8Epd27SNFL2tzyYJqUHyYuq0EmQBLtOn2Q8MsJxgWOPUyT2YZGZvZINXsm557I3RIKmZhuw6JXJn29G00ccEnQgmm"

Open android studio and click on device manager. Run an android device if you have one. If not, then create one by clicking:
Add a new device > Create Virtual Device > Pixel 9 Pro > VanillaIceCream > Finish.

Once the virtual device is running, open command prompt and enter the command:

cd (insert project directory here)

Once the directory is open, execute the commands:

npm install
cd backend

When the directory has been changed to backend execute these following commands:

npm init -y
npm install express stripe cors
node server.js

Keep this window open as it is running the server in the background.

To run the app itself open another command prompt and execute:

npx expo start
in the project directory

Once the app has started, press a and the app should install and open on the virtual device automatically.

## Participant Tasks
Task: Create an account or sign in.

Task: Order a service.

Task: Modify your garage.

Task: Check your service history.

Task: Search for a service.

Task: Order a service from Pitstop Pulse.
