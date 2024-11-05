// src/components/CheckoutForm.js
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const CheckoutForm = ({ projectCost }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const token = localStorage.getItem('token'); // Obtén el token de autorización

            // Solicitar el PaymentIntent desde el backend
            const { data } = await axios.post(
                'http://localhost:3000/api/payment-intent',
                { amount: projectCost },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const clientSecret = data.clientSecret;

            const cardElement = elements.getElement(CardElement);
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (error) {
                setErrorMessage(error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                alert('¡Pago realizado exitosamente!');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('Error procesando el pago. Inténtelo de nuevo.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button type="submit" disabled={!stripe || isProcessing}>
                {isProcessing ? 'Procesando...' : 'Pagar'}
            </button>
        </form>
    );
};

export default CheckoutForm;
