import express from 'express'
import cors from 'cors'
import {connectDB} from './config/db.js'
import foodRouter from './routes/foodRoutes.js'
import userRouter from './routes/userRoutes.js'
import dotenv from 'dotenv'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'

dotenv.config()

//app config

const app = express()

const port =4000

app.use(express.json())
app.use(cors())

connectDB();

app.use('/api/food',foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)

app.get("/",(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})

// mongodb+srv://adrijakarmakar_db_user:@cluster0.u88cefg.mongodb.net/?
