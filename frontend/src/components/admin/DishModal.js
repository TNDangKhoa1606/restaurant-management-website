import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../pages/profile/AddAddressModal.css'; // Reuse the CSS

const DishModal = ({ isOpen, onClose, onSave, dish, token }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        category_id: '',
        image_url: '',
        status: 'available',
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const response = await axios.get('/api/menu/categories', config);
                setCategories(response.data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
                setError('Không thể tải danh mục món ăn.');
            }
        };

        if (isOpen && token) {
            fetchCategories();
        }

        if (dish) {
            setFormData({
                name: dish.name || '',
                price: dish.price || 0,
                category_id: dish.category_id || '',
                image_url: dish.image_url || '',
                status: dish.status || 'available',
            });
        } else {
            setFormData({ name: '', price: 0, category_id: '', image_url: '', status: 'available' });
        }
        setSelectedFile(null); // Reset file input on open
        setError('');
    }, [dish, isOpen, token]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name.trim() || !formData.category_id) {
            setError('Tên món và danh mục không được để trống.');
            return;
        }
        onSave(formData, selectedFile);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{dish ? 'Chỉnh sửa Món ăn' : 'Thêm Món ăn mới'}</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="name">Tên món ăn</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Giá</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category_id">Danh mục</label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => (
                                <option key={cat.category_id} value={cat.category_id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Hình ảnh</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleFileChange}
                        />
                        {formData.image_url && !selectedFile && (
                            <div style={{ marginTop: '10px' }}>
                                <p>Ảnh hiện tại:</p>
                                <img 
                                    src={formData.image_url.startsWith('http') ? formData.image_url : `http://localhost:5000${formData.image_url}`} 
                                    alt="Current dish" 
                                    style={{ width: '150px', height: 'auto', borderRadius: '8px', border: '1px solid #ddd' }} 
                                />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Trạng thái</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="available">Còn hàng</option>
                            <option value="unavailable">Hết hàng</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-admin btn-admin-primary">Lưu</button>
                        <button type="button" onClick={onClose} className="btn-admin btn-admin-secondary">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DishModal;
