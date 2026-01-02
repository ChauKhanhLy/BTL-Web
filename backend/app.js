import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { supabase } from './database/supabase.js'


import foodRoutes from './routes/food.routes.js'
import orderRoutes from "./routes/order.routes.js"
import statsRoutes from "./routes/stats.routes.js"
import feedbackRoutes from "./routes/feedback.routes.js"
import menuRoutes from "./routes/menu.routes.js"
import inventoryRoutes from './routes/inventory.routes.js'
import "./cron/menu.cron.js";
import { autoGenerateMenu, autoGenerateMenuIfMissing } from "./services/menu.auto.service.js";


import authRoutes from "./routes/auth.routes.js"
import mealWalletRoutes from "./routes/mealWallet.routes.js";
import { errorHandler } from './middleware/errorHandler.js';
/*import menuRoutes from "./routes/menu.routes.js"
import "./cron/menu.cron.js";
import { autoGenerateMenu, autoGenerateMenuIfMissing } from "./services/menu.auto.service.js";*/



const app = express()

app.use(cors())
app.use(express.json())

app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('food').select('*')
  res.json({ data, error })
})


app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/feedback", feedbackRoutes)
app.use("/api/inventory", inventoryRoutes);
app.use("/api/menu", menuRoutes)
app.use("/api/meal-wallet", mealWalletRoutes);



app.get('/', (req, res) => {
  res.send('Backend is running ')
})

app.use(errorHandler);
autoGenerateMenu();
const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
  console.log(`Server running on ${PORT}`);

  autoGenerateMenuIfMissing()
    .then(() => {
      console.log("Auto menu done");
    })
    .catch(err => {
      console.error("Auto menu error:", err);
    });
});
