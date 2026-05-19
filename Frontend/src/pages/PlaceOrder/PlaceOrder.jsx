import React, { useContext,useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const PlaceOrder = () => {
    const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems } = useContext(StoreContext)
    const navigate = useNavigate()
useEffect(() => {

    if (!token) {

        navigate('/cart')

        return;
    }

    if (food_list.length > 0 && getTotalCartAmount() === 0) {

        navigate('/cart')

    }

}, [token, cartItems, food_list])
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true)
                return
            }

            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const placeOrder = async (event) => {
        event.preventDefault()

        if (!token) {
            toast.error("Please login to place an order")
            return
        }

        const orderItems = []
        food_list.forEach((item) => {
            if (cartItems[item._id] > 0) {
                orderItems.push({
                    ...item,
                    quantity: cartItems[item._id]
                })
            }
        })

        if (orderItems.length === 0) {
            toast.error("Your cart is empty")
            return
        }

        const scriptLoaded = await loadRazorpayScript()

        if (!scriptLoaded) {
            toast.error("Unable to load Razorpay checkout")
            return
        }

        const amount = getTotalCartAmount() + 2
        const orderData = {
            address: data,
            items: orderItems,
            amount
        }

        let response

        try {
            response = await axios.post(url + "/api/order/place", orderData, { headers: { token } })
        } catch (error) {
            toast.error("Unable to create payment order")
            return
        }

        if (!response.data.success) {
            toast.error(response.data.message)
            return
        }

        const options = {
            key: response.data.key,
            amount: response.data.amount,
            currency: response.data.currency,
            name: "Food Delivery",
            description: "Food order payment",
            order_id: response.data.razorpayOrderId,
            prefill: {
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                contact: data.phone
            },
            handler: async (paymentResponse) => {
                try {
                    const verifyResponse = await axios.post(url + "/api/order/verify", {
                        orderId: response.data.orderId,
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_signature: paymentResponse.razorpay_signature
                    }, { headers: { token } })

                    if (verifyResponse.data.success) {
                        setCartItems({})
                        toast.success("Payment successful")
                        navigate("/")
                    } else {
                        toast.error(verifyResponse.data.message)
                    }
                } catch (error) {
                    toast.error("Unable to verify payment")
                }
            },
            theme: {
                color: "#ff6347"
            }
        }

        const paymentObject = new window.Razorpay(options)
        paymentObject.open()
    }

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className="place-order-left">
                <p className='title'>Delivery Information</p>

                <div className="multi-fields">
                    <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
                    <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
                </div>

                <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
                <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />

                <div className="multi-fields">
                    <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
                    <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
                </div>

                <div className="multi-fields">
                    <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
                    <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
                </div>

                <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
            </div>

            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Cart Totals</h2>

                    <div>
                        <div className="cart-total-details">
                            <p>Subtotal</p>
                            <p>Rs. {getTotalCartAmount()}</p>
                        </div>

                        <hr />

                        <div className="cart-total-details">
                            <p>Delivery Fee</p>
                            <p>Rs. {getTotalCartAmount() === 0 ? 0 : 2}</p>
                        </div>

                        <hr />

                        <div className="cart-total-details">
                            <b>Total</b>
                            <b>Rs. {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
                        </div>
                    </div>

                    <button type='submit'>PROCEED TO PAYMENT</button>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder
