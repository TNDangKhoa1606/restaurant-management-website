import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../pages/AuthContext';
import IngredientModal from '../../components/admin/IngredientModal';
import SupplyModal from '../../components/admin/SupplyModal';
import DishModal from '../../components/admin/DishModal'; // Import DishModal
import { useNotification } from '../../components/common/NotificationContext';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

function InventoryManagement() {
    const [activeTab, setActiveTab] = useState('ingredients');
    const [data, setData] = useState({ ingredients: [], dishes: [], supplies: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, loading: authLoading } = useAuth();
    const { confirm } = useNotification();

    const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [isSupplyModalOpen, setSupplyModalOpen] = useState(false);
    const [editingSupply, setEditingSupply] = useState(null);
    const [isDishModalOpen, setDishModalOpen] = useState(false);
    const [editingDish, setEditingDish] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchData = useCallback(async (tab) => {
        if (!token) {
            setError("Xác thực không hợp lệ, không thể tải dữ liệu.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(`/api/inventory/${tab}`, config);
            setData(prevData => ({ ...prevData, [tab]: response.data }));
        } catch (err) {
            setError(`Không thể tải dữ liệu ${tab}. Lỗi: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) {
            fetchData(activeTab);
        } else if (!authLoading && !token) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem dữ liệu.");
        }
    }, [activeTab, token, authLoading, fetchData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Ingredient Handlers
    const handleOpenAddIngredientModal = () => {
        setEditingIngredient(null);
        setIngredientModalOpen(true);
    };

    const handleEditIngredient = (ingredient) => {
        setEditingIngredient(ingredient);
        setIngredientModalOpen(true);
    };

    const handleDeleteIngredient = async (ingredientId) => {
        const confirmed = await confirm({
            title: 'Xóa nguyên liệu',
            message: 'Bạn có chắc chắn muốn xóa nguyên liệu này không?',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(`/api/inventory/ingredients/${ingredientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(activeTab);
        } catch (err) {
            alert(`Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleSaveIngredient = async (ingredientData) => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            if (editingIngredient) {
                await axios.put(`/api/inventory/ingredients/${editingIngredient.ingredient_id}`, ingredientData, config);
            } else {
                await axios.post('/api/inventory/ingredients', ingredientData, config);
            }
            setIngredientModalOpen(false);
            fetchData(activeTab);
        } catch (err) {
            alert(`Lỗi khi lưu: ${err.response?.data?.message || err.message}`);
        }
    };

    // Supply Handlers
    const handleOpenAddSupplyModal = () => {
        setEditingSupply(null);
        setSupplyModalOpen(true);
    };

    const handleEditSupply = (supply) => {
        setEditingSupply(supply);
        setSupplyModalOpen(true);
    };

    const handleDeleteSupply = async (supplyId) => {
        const confirmed = await confirm({
            title: 'Xóa vật tư',
            message: 'Bạn có chắc chắn muốn xóa vật tư này không?',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(`/api/inventory/supplies/${supplyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(activeTab);
        } catch (err) {
            alert(`Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleSaveSupply = async (supplyData) => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            if (editingSupply) {
                await axios.put(`/api/inventory/supplies/${editingSupply.supply_id}`, supplyData, config);
            } else {
                await axios.post('/api/inventory/supplies', supplyData, config);
            }
            setSupplyModalOpen(false);
            fetchData(activeTab);
        } catch (err) {
            alert(`Lỗi khi lưu: ${err.response?.data?.message || err.message}`);
        }
    };

    // Dish Handlers
    const handleOpenAddDishModal = () => {
        setEditingDish(null);
        setDishModalOpen(true);
    };

    const handleEditDish = (dish) => {
        setEditingDish(dish);
        setDishModalOpen(true);
    };

    const handleDeleteDish = async (dishId) => {
        const confirmed = await confirm({
            title: 'Xóa món ăn',
            message: 'Bạn có chắc chắn muốn xóa món ăn này không?',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(`/api/inventory/dishes/${dishId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(activeTab);
        } catch (err) {
            alert(`Lỗi khi xóa: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleSaveDish = async (dishData, file) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type' is set automatically by the browser for FormData
                }
            };

            let dataToSend;
            if (file) {
                const formData = new FormData();
                Object.keys(dishData).forEach(key => {
                    formData.append(key, dishData[key]);
                });
                formData.append('image', file);
                dataToSend = formData;
            } else {
                dataToSend = dishData;
                config.headers['Content-Type'] = 'application/json';
            }

            if (editingDish) {
                await axios.put(`/api/inventory/dishes/${editingDish.dish_id}`, dataToSend, config);
            } else {
                await axios.post('/api/inventory/dishes', dataToSend, config);
            }
            setDishModalOpen(false);
            fetchData(activeTab);
        } catch (err) {
            alert(`Lỗi khi lưu: ${err.response?.data?.message || err.message}`);
        }
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'ingredients':
                return (
                    <IngredientsTable
                        ingredients={data.ingredients}
                        onEdit={handleEditIngredient}
                        onDelete={handleDeleteIngredient}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        pageSize={pageSize}
                    />
                );
            case 'dishes': {
                const totalItems = data.dishes.length;
                const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
                const safeCurrentPage = Math.min(currentPage, totalPages);
                const startIndex = (safeCurrentPage - 1) * pageSize;
                const paginatedDishes = data.dishes.slice(startIndex, startIndex + pageSize);

                return (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Ảnh</th>
                                    <th>Tên món</th>
                                    <th>Loại món</th>
                                    <th>Giá</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.dishes.length > 0 ? paginatedDishes.map(item => (
                                    <tr key={item.dish_id}>
                                        <td><img src={`http://localhost:5000${item.image_url}`} alt={item.name} className="menu-item-image" /></td>
                                        <td>{item.name}</td>
                                        <td>{item.category_name}</td>
                                        <td>{formatPrice(item.price)}</td>
                                        <td>
                                            <span className={`status-badge ${item.status === 'available' ? 'status-active' : 'status-inactive'}`}>
                                                {item.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button onClick={() => handleEditDish(item)} className="action-btn btn-edit">Sửa</button>
                                            <button onClick={() => handleDeleteDish(item.dish_id)} className="action-btn btn-delete">Xóa</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center' }}>Không có món ăn nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {data.dishes.length > 0 && (
                            <div className="admin-pagination">
                                <div className="admin-pagination-info">
                                    Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} trên {totalItems} kết quả
                                </div>
                                <div className="admin-pagination-controls">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={safeCurrentPage === 1}
                                    >
                                        Trước
                                    </button>
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => setCurrentPage(index + 1)}
                                            className={safeCurrentPage === index + 1 ? 'active' : ''}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={safeCurrentPage === totalPages}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                );
            }
            case 'supplies':
                return (
                    <SuppliesTable
                        supplies={data.supplies}
                        onEdit={handleEditSupply}
                        onDelete={handleDeleteSupply}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        pageSize={pageSize}
                    />
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="admin-list-container">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Quản lý kho</h2>
                <div className="admin-tabs">
                    <button onClick={() => setActiveTab('ingredients')} className={`btn-admin ${activeTab === 'ingredients' ? 'btn-admin-primary' : 'btn-admin-secondary'}`} style={{ marginRight: '10px' }}>Nguyên liệu</button>
                    <button onClick={() => setActiveTab('dishes')} className={`btn-admin ${activeTab === 'dishes' ? 'btn-admin-primary' : 'btn-admin-secondary'}`} style={{ marginRight: '10px' }}>Món ăn</button>
                    <button onClick={() => setActiveTab('supplies')} className={`btn-admin ${activeTab === 'supplies' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}>Vật tư</button>
                </div>
            </div>

            <div className="admin-table-container">
                <div className="filters" style={{ marginBottom: '20px' }}>
                    {activeTab === 'ingredients' && <button onClick={handleOpenAddIngredientModal} className="btn-admin btn-admin-primary">Nhập nguyên liệu</button>}
                    {activeTab === 'dishes' && <button onClick={handleOpenAddDishModal} className="btn-admin btn-admin-primary">Thêm món</button>}
                    {activeTab === 'supplies' && <button onClick={handleOpenAddSupplyModal} className="btn-admin btn-admin-primary">Nhập vật tư</button>}
                </div>
                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    renderContent()
                )}
            </div>
            {activeTab === 'ingredients' && (
                <IngredientModal
                    isOpen={isIngredientModalOpen}
                    onClose={() => setIngredientModalOpen(false)}
                    onSave={handleSaveIngredient}
                    ingredient={editingIngredient} />
            )}
            {activeTab === 'supplies' && (
                <SupplyModal
                    isOpen={isSupplyModalOpen}
                    onClose={() => setSupplyModalOpen(false)}
                    onSave={handleSaveSupply}
                    supply={editingSupply} />
            )}
            {activeTab === 'dishes' && (
                <DishModal
                    isOpen={isDishModalOpen}
                    onClose={() => setDishModalOpen(false)}
                    onSave={handleSaveDish}
                    dish={editingDish}
                    token={token} />
            )}
        </div>
    );
}

const IngredientsTable = ({ ingredients, onEdit, onDelete, currentPage, setCurrentPage, pageSize }) => {
    const totalItems = ingredients.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const paginatedIngredients = ingredients.slice(startIndex, startIndex + pageSize);

    return (
        <>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Tên nguyên liệu</th>
                        <th>Số lượng tồn</th>
                        <th>Đơn vị</th>
                        <th>Mức cảnh báo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients.length > 0 ? paginatedIngredients.map(item => (
                        <tr key={item.ingredient_id} className={item.stock_quantity < item.warning_level ? 'low-stock-warning' : ''}>
                            <td>{item.name}</td>
                            <td>{item.stock_quantity}</td>
                            <td>{item.unit}</td>
                            <td>{item.warning_level}</td>
                            <td className="actions-cell">
                                <button onClick={() => onEdit(item)} className="action-btn btn-edit">Sửa</button>
                                <button onClick={() => onDelete(item.ingredient_id)} className="action-btn btn-delete">Xóa</button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>Không có dữ liệu nguyên liệu.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {ingredients.length > 0 && (
                <div className="admin-pagination">
                    <div className="admin-pagination-info">
                        Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} trên {totalItems} kết quả
                    </div>
                    <div className="admin-pagination-controls">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={safeCurrentPage === 1}
                        >
                            Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className={safeCurrentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={safeCurrentPage === totalPages}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const SuppliesTable = ({ supplies, onEdit, onDelete, currentPage, setCurrentPage, pageSize }) => {
    const totalItems = supplies.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const paginatedSupplies = supplies.slice(startIndex, startIndex + pageSize);

    return (
        <>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Tên vật tư</th>
                        <th>Số lượng tồn</th>
                        <th>Đơn vị</th>
                        <th>Loại vật tư</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {supplies.length > 0 ? paginatedSupplies.map(item => (
                        <tr key={item.supply_id}>
                            <td>{item.name}</td>
                            <td>{item.stock_quantity}</td>
                            <td>{item.unit}</td>
                            <td>{item.type}</td>
                            <td className="actions-cell">
                                <button onClick={() => onEdit(item)} className="action-btn btn-edit">Sửa</button>
                                <button onClick={() => onDelete(item.supply_id)} className="action-btn btn-delete">Xóa</button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>Không có dữ liệu vật tư.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {supplies.length > 0 && (
                <div className="admin-pagination">
                    <div className="admin-pagination-info">
                        Hiển thị {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} trên {totalItems} kết quả
                    </div>
                    <div className="admin-pagination-controls">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={safeCurrentPage === 1}
                        >
                            Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className={safeCurrentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={safeCurrentPage === totalPages}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default InventoryManagement;