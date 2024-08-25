import axios from 'axios';
import { config } from '../config/config';

const BASE_URL = config.baseURL;

export const createPayPalPayment = async (ownerId, petId, paymentDescription) => {
    try {
        const response = await axios.post(`${BASE_URL}/paypal/create-order/${ownerId}/${petId}`, {
            description: paymentDescription
        });
        return response.data;
    } catch (error) {
        throw new Error('PayPal payment error: ' + error.message);
    }
};

export const capturePayPalPayment = async (orderID, owner_id, petName, pet_id, description) => {
    try {
        const response = await axios.post(`${BASE_URL}/paypal/capture-order`, { orderID, owner_id, petName, pet_id, description });
        return response.data;
    } catch (error) {
        throw new Error('PayPal capture error: ' + error.message);
    }
};

export const createStripePaymentIntent = async (amount, currency, description) => {
    try {
        const response = await axios.post(`${BASE_URL}/stripe/create-payment-intent`, {
            amount: amount,
            currency: currency,
            description: description,
        });
        return response.data.clientSecret;
    } catch (error) {
        throw new Error('Stripe payment error: ' + error.message);
    }
};

export const captureCreditCardPayment = async (owner_id, petName, pet_id, description, paymentIntent) => {
    try {
        const response = await axios.post(`${BASE_URL}/stripe/capture-order`, { owner_id, petName, pet_id, description, paymentIntent });
        return response.data;
    } catch (error) {
        throw new Error('Credit Card capture error: ' + error.message);
    }
};

export const updatePetSubscription = async (petId) => {
    try {
        const response = await axios.put(`${BASE_URL}/paypal/update-subscription/${petId}`);
        return response.data;
    } catch (error) {
        throw new Error('PayPal capture error: ' + error.message);
    }
};
