// src/components/PaymentModal.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

// Reemplaza esto con tu clave pública de Stripe
const stripePromise = loadStripe('pk_test_51Q9ZhsRqwuaDZ9m7VEq5s6CE6cZ4uFNTf2nGzHnFJFBP7aS9eovjb961hoSTtScnTpy8G9GgVYgV8QatPQUcd9ij00bgAbfu5L');

const PaymentModal = ({ show, onClose, projectCost }) => {
    if (!show) return null;

    const cost = parseFloat(projectCost) || 0;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <button onClick={onClose} className="close-button">X</button>
                <h2>Pago de Proyecto</h2>
                <p>Monto: ${cost.toFixed(2)}</p>
                <Elements stripe={stripePromise}>
                    <CheckoutForm projectCost={cost} />
                </Elements>
            </div>
        </div>
    );
};

export default PaymentModal;
