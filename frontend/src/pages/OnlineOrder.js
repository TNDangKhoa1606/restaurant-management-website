import React from 'react';
import { useNavigate } from 'react-router-dom';
import PreOrderPopup from '../components/reservation/PreOrderPopup';

function OnlineOrder() {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/');
    };

    const handleSubmit = (items) => {
        if (!items || !items.length) {
            return;
        }

        const cartItems = items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            image: item.image,
        }));

        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Không thể lưu giỏ hàng vào localStorage từ OnlineOrder:', error);
        }

        navigate('/checkout');
    };

    return (
        <PreOrderPopup onClose={handleClose} onSubmit={handleSubmit} />
    );
}

export default OnlineOrder;
