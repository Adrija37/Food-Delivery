import mongoose from 'mongoose'

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://adrijakarmakar_db_user:adrija300904@cluster0.u88cefg.mongodb.net/FoodDelivery').then(()=>console.log("DB Connected"));
}

