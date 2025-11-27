import React, { useState } from 'react';
import './AddressBook.css';
import AddAddressModal from './AddAddressModal';

const AddressBook = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Dữ liệu mẫu cho sổ địa chỉ
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            label: 'Nhà riêng',
            name: 'Nguyễn Văn An',
            phone: '0911111111',
            address: '123 Đường ABC, Phường 1, Quận 1, TP. Hồ Chí Minh',
            isDefault: true,
        },
        {
            id: 2,
            label: 'Công ty',
            name: 'Nguyễn Văn An',
            phone: '0911111111',
            address: 'Tòa nhà Bitexco, 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            isDefault: false,
        },
    ]);

    const handleAddAddress = (newAddress) => {
        // Thêm địa chỉ mới vào danh sách (chỉ cho mục đích demo)
        setAddresses(prev => [...prev, { ...newAddress, id: Date.now() }]);
    };

    return (
        <>
            <div className="address-book-section">
                <div className="address-book-header">
                    <div>
                        <h2 className="content-title">Sổ địa chỉ</h2>
                        <p className="content-subtitle">Quản lý địa chỉ nhận hàng của bạn.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn-add-address"><i className="fas fa-plus"></i> Thêm địa chỉ mới</button>
                </div>

                <div className="address-list">
                    {addresses.map(addr => (
                        <div key={addr.id} className="address-card">
                            <div className="address-card-main">
                                <div className="address-label">{addr.label} {addr.isDefault && <span className="default-badge">Mặc định</span>}</div>
                                <p><strong>{addr.name}</strong> | {addr.phone}</p>
                                <p>{addr.address}</p>
                            </div>
                            <div className="address-card-actions">
                                <button className="btn-action">Sửa</button>
                                <button className="btn-action btn-delete">Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && <AddAddressModal onClose={() => setIsModalOpen(false)} onAddAddress={handleAddAddress} />}
        </>
    );
};

export default AddressBook;