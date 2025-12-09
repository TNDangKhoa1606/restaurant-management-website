import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TableMap.css';
import { useAuth } from '../../AuthContext'; // Import useAuth để kiểm tra vai trò
import TableModal from '../../../components/admin/TableModal';
import floorStaticElements from '../../../config/floorStaticElements';
import { useNotification } from '../../../components/common/NotificationContext';

const statusMap = {
    free: { text: 'TRỐNG', className: 'st-vacant' },
    occupied: { text: 'ĐANG PHỤC VỤ', className: 'st-occupied' },
    reserved: { text: 'ĐÃ ĐẶT', className: 'st-checked' },
};

const getShapeByCapacity = (capacity) => {
    if (capacity <= 2) return 'shape-duo';
    if (capacity <= 6) return 'shape-mid';
    return 'shape-large';
};

const POSITION_MIN_PERCENT = 3;
const POSITION_MAX_PERCENT = 97;

const clampPercent = (value) => Math.min(Math.max(value, POSITION_MIN_PERCENT), POSITION_MAX_PERCENT);
const formatPercent = (value) => Number(clampPercent(value).toFixed(2));

const PlanElement = ({
    element,
    isAdmin,
    onEdit,
    isMerging,
    onSelectMerge,
    isSelected,
    isRepositioning,
    onDragInit,
    overridePosition,
    isDragging,
    isSavingPosition,
}) => {
    const effectiveX = overridePosition?.x ?? Number(element.pos_x) ?? 0;
    const effectiveY = overridePosition?.y ?? Number(element.pos_y) ?? 0;

    const style = {
        left: `${effectiveX}%`,
        top: `${effectiveY}%`,
    };

    if (element.type === 'static') {
        return (
            <div className="static-element" style={{ ...style, width: `${element.width}%`, height: `${element.height}%` }}>
                {element.label}
            </div>
        );
    }

    const statusInfo = statusMap[element.status] || statusMap.free;
    const hasPreorder = !!element.preorder_info;
    const shapeClass = getShapeByCapacity(element.capacity);

    const handleNodeClick = () => {
        if (!isAdmin || isRepositioning) return;
        if (isMerging) onSelectMerge(element);
        else onEdit(element);
    };

    const handleDragMouseDown = (event) => {
        if (!isRepositioning || typeof onDragInit !== 'function') return;
        if (event.button !== 0) return; // Only left click
        event.preventDefault();
        onDragInit(event, element);
    };

    if (isAdmin) {
        const adminClasses = [
            'admin-editable',
            isMerging && element.status === 'free' ? 'merge-selectable' : '',
            isSelected ? 'selected-for-merge' : '',
            isRepositioning ? 'draggable-node' : '',
            isDragging ? 'dragging' : '',
            isSavingPosition ? 'drag-saving' : '',
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div
                onClick={isRepositioning ? undefined : handleNodeClick}
                onMouseDown={isRepositioning ? handleDragMouseDown : undefined}
                className={`node ${shapeClass} ${statusInfo.className} ${adminClasses}`}
                style={style}
            >
                {hasPreorder && <span className="preorder-chip">Pre-order</span>}
                <div className="node-label">
                    <span className="node-code">{element.table_name}</span>
                    <div className="node-capacity-group">
                        <i className="fas fa-user-friends"></i>
                        <span className="node-capacity">{element.capacity}</span>
                    </div>
                </div>
            </div>
        );
    }

    const linkTo = element.status === 'free' ? `/table/${element.table_id}` : `/waiter/order/${element.order_id || element.table_id}`;
    const titleText = hasPreorder
        ? `Pre-order: ${element.preorder_info.preorder_details?.items?.length || 0} món - Khách ${element.preorder_info.guest_name}`
        : `Bàn ${element.table_name}`;

    return (
        <Link to={linkTo} className={`node ${shapeClass} ${statusInfo.className}`} style={style} title={titleText}>
            {hasPreorder && <span className="preorder-chip">Pre-order</span>}
            <div className="node-label">
                <span className="node-code">{element.table_name}</span>
                <div className="node-capacity-group">
                    <i className="fas fa-user-friends"></i>
                    <span className="node-capacity">{element.capacity}</span>
                </div>
            </div>
        </Link>
    );
};

const TableMap = () => {
    const [floors, setFloors] = useState([]);
    const [currentFloorId, setCurrentFloorId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token, loading: authLoading } = useAuth(); // Lấy thông tin người dùng từ context
    const isAdmin = user?.role === 'Admin';
    const [isTableModalOpen, setTableModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [preordersByTable, setPreordersByTable] = useState({});
    const [isRepositioning, setIsRepositioning] = useState(false);
    const planAreaRef = useRef(null);
    const [draggingInfo, setDraggingInfo] = useState(null);
    const [dragPreview, setDragPreview] = useState(null);
    const [savingTableId, setSavingTableId] = useState(null);
    const { confirm, notify } = useNotification();

    const fetchTableData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const { data } = await axios.get('/api/tables/floors', config);
            setFloors(data);
            if (data.length > 0 && !currentFloorId) {
                setCurrentFloorId(data[0].floor_id);
            }
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải sơ đồ bàn.');
        } finally {
            setLoading(false);
        }
    }, [token, currentFloorId]);

    const fetchPreorders = useCallback(async () => {
        if (!token) return;
        try {
            const today = new Date().toLocaleDateString('sv-SE');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { date: today, status: 'booked' },
            };
            const { data } = await axios.get('/api/reservations', config);
            const preorderMap = {};
            data.forEach(reservation => {
                if (reservation.has_preorder && reservation.table_id) {
                    preorderMap[reservation.table_id] = reservation;
                }
            });
            setPreordersByTable(preorderMap);
        } catch (err) {
            console.error('Không thể tải pre-order cho bàn:', err);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading) {
            fetchTableData();
            fetchPreorders();
        }
    }, [authLoading, fetchTableData, fetchPreorders]);

    const floorData = useMemo(() => {
        const baseFloor = floors.find(f => f.floor_id === currentFloorId);
        if (!baseFloor) {
            return { name: '', elements: [] };
        }

        const staticElements = floorStaticElements[baseFloor.floor_id] || [];

        return {
            ...baseFloor,
            elements: [
                ...((baseFloor.elements || []).map(element => ({
                    ...element,
                    preorder_info: preordersByTable[element.table_id] || null,
                }))),
                ...staticElements,
            ],
        };
    }, [floors, currentFloorId, preordersByTable]);

    const handleOpenAddModal = () => {
        setEditingTable(null);
        setTableModalOpen(true);
    };

    const handleOpenEditModal = (table) => {
        setEditingTable(table);
        setTableModalOpen(true);
    };

    const handleSaveTable = async (tableData) => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            if (editingTable) {
                await axios.put(`/api/tables/${editingTable.table_id}`, tableData, config);
                notify('Cập nhật bàn thành công!', 'success');
            } else {
                await axios.post('/api/tables', tableData, config);
                notify('Thêm bàn mới thành công!', 'success');
            }
            setTableModalOpen(false);
            fetchTableData(); // Tải lại dữ liệu để hiển thị bàn mới
        } catch (err) {
            notify(`Lỗi khi lưu bàn: ${err.response?.data?.message || err.message}`, 'error');
        }
    };

    const handleDeleteTable = async (tableId) => {
        const confirmed = await confirm({
            title: 'Xóa bàn',
            message: 'Bạn có chắc chắn muốn xóa bàn này? Tất cả các lượt đặt bàn trong tương lai liên quan đến bàn này cũng sẽ bị hủy.',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.delete(`/api/tables/${tableId}`, config);
            notify('Xóa bàn thành công!', 'success');
            setTableModalOpen(false);
            fetchTableData(); // Tải lại dữ liệu
        } catch (err) {
            notify(`Lỗi khi xóa bàn: ${err.response?.data?.message || err.message}`, 'error');
        }
    };

    const toggleRepositionMode = () => {
        setIsRepositioning((prev) => !prev);
        setDraggingInfo(null);
        setDragPreview(null);
    };

    const getPointerPercent = useCallback((clientX, clientY) => {
        const area = planAreaRef.current;
        if (!area) return null;
        const rect = area.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        const relativeX = ((clientX - rect.left) / rect.width) * 100;
        const relativeY = ((clientY - rect.top) / rect.height) * 100;
        return {
            x: clampPercent(relativeX),
            y: clampPercent(relativeY),
        };
    }, []);

    const saveTablePosition = useCallback(async (table, position) => {
        if (!token) return;
        setSavingTableId(table.table_id);
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const payload = {
                table_name: table.table_name,
                capacity: table.capacity,
                floor_id: table.floor_id,
                pos_x: formatPercent(position.x),
                pos_y: formatPercent(position.y),
                price: table.price != null ? table.price : 0,
            };
            await axios.put(`/api/tables/${table.table_id}`, payload, config);
            await fetchTableData();
        } catch (err) {
            notify(`Không thể lưu vị trí mới cho bàn ${table.table_name}: ${err.response?.data?.message || err.message}`, 'error');
        } finally {
            setSavingTableId(null);
        }
    }, [token, fetchTableData, notify]);

    const handleDragStart = useCallback((event, table) => {
        if (!isAdmin || !isRepositioning) return;
        const pointerPercent = getPointerPercent(event.clientX, event.clientY);
        if (!pointerPercent) return;
        const currentX = Number(table.pos_x) || 0;
        const currentY = Number(table.pos_y) || 0;
        setDraggingInfo({
            table,
            offset: {
                x: pointerPercent.x - currentX,
                y: pointerPercent.y - currentY,
            },
        });
        setDragPreview({
            tableId: table.table_id,
            pos: { x: currentX, y: currentY },
        });
    }, [isAdmin, isRepositioning, getPointerPercent]);

    const finalizeDrag = useCallback(async (clientX, clientY) => {
        if (!draggingInfo) return;
        const currentDrag = draggingInfo;
        let finalPos = dragPreview?.pos;

        if (typeof clientX === 'number' && typeof clientY === 'number') {
            const pointerPercent = getPointerPercent(clientX, clientY);
            if (pointerPercent) {
                finalPos = {
                    x: formatPercent(pointerPercent.x - currentDrag.offset.x),
                    y: formatPercent(pointerPercent.y - currentDrag.offset.y),
                };
            }
        }

        setDraggingInfo(null);
        setDragPreview(null);

        if (!finalPos) return;
        const originalX = Number(currentDrag.table.pos_x) || 0;
        const originalY = Number(currentDrag.table.pos_y) || 0;
        const hasChanged = Math.abs(finalPos.x - originalX) > 0.2 || Math.abs(finalPos.y - originalY) > 0.2;
        if (!hasChanged) return;

        await saveTablePosition(currentDrag.table, finalPos);
    }, [draggingInfo, dragPreview, getPointerPercent, saveTablePosition]);

    useEffect(() => {
        if (!draggingInfo) return;

        const handleMouseMove = (event) => {
            event.preventDefault();
            const pointerPercent = getPointerPercent(event.clientX, event.clientY);
            if (!pointerPercent) return;
            const newPos = {
                x: formatPercent(pointerPercent.x - draggingInfo.offset.x),
                y: formatPercent(pointerPercent.y - draggingInfo.offset.y),
            };
            setDragPreview((prev) =>
                prev && prev.tableId === draggingInfo.table.table_id
                    ? { ...prev, pos: newPos }
                    : { tableId: draggingInfo.table.table_id, pos: newPos }
            );
        };

        const handleMouseUp = (event) => {
            event.preventDefault();
            finalizeDrag(event.clientX, event.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingInfo, finalizeDrag, getPointerPercent]);

    return (
        <div className="table-map-container">
            <div className="map-toolbar">
                <h2 className="table-map-title">Sơ đồ bàn: {loading ? 'Đang tải...' : floorData.name}</h2>
                <div className="segment">
                    {floors.map(floor => (
                        <button
                            key={floor.floor_id}
                            className={`seg-btn ${currentFloorId === floor.floor_id ? 'active' : ''}`}
                            onClick={() => setCurrentFloorId(floor.floor_id)}>
                            {floor.name}
                        </button>
                    ))}
                </div>
                {isAdmin && (
                    <div className="admin-actions">
                        <button onClick={handleOpenAddModal} className="btn-admin btn-admin-primary" disabled={isRepositioning}>Thêm bàn</button>
                        <button onClick={toggleRepositionMode} className={`btn-admin ${isRepositioning ? 'btn-admin-danger' : 'btn-admin-secondary'}`}>
                            {isRepositioning ? 'Hủy sắp xếp' : 'Sắp xếp bàn'}
                        </button>
                    </div>
                )}
                <div className="legend">
                    <span className="legend-item legend-occupied">ĐANG PHỤC VỤ</span>
                    <span className="legend-item legend-vacant">TRỐNG (CHƯA ĐẶT)</span>
                    <span className="legend-item legend-checked">ĐÃ ĐẶT</span>
                </div>
            </div>

            {isRepositioning && (
                <p className="reposition-hint">Kéo và thả các bàn trên sơ đồ để sắp xếp lại. Hệ thống sẽ lưu tự động ngay khi bạn thả bàn.</p>
            )}

            {loading && <div className="loading-overlay">Đang tải dữ liệu bàn...</div>}
            {error && <div className="error-overlay">{error}</div>}

            {!loading && !error && ( // Bắt đầu điều kiện render
                <div
                    className={`floor-plan-area ${isRepositioning ? 'reposition-mode' : ''} ${draggingInfo ? 'dragging' : ''}`}
                    ref={planAreaRef}
                >
                    {floorData.elements.map((element) => {
                        const overridePosition = dragPreview && element.table_id && dragPreview.tableId === element.table_id ? dragPreview.pos : null;
                        const isDraggingThis = draggingInfo?.table?.table_id === element.table_id;
                        const isSavingThis = savingTableId === element.table_id;
                        return (
                            <PlanElement
                                key={element.table_id || element.id}
                                element={element}
                                isAdmin={isAdmin}
                                onEdit={handleOpenEditModal}
                                isMerging={false}
                                onSelectMerge={() => {}}
                                isSelected={false}
                                isRepositioning={isRepositioning && isAdmin}
                                onDragInit={handleDragStart}
                                overridePosition={overridePosition}
                                isDragging={isDraggingThis}
                                isSavingPosition={isSavingThis}
                            />
                        );
                    })}
                </div>
            )}

            <TableModal
                isOpen={isTableModalOpen}
                onClose={() => setTableModalOpen(false)}
                onSave={handleSaveTable}
                onDelete={handleDeleteTable}
                table={editingTable}
                floors={floors}
                currentFloorId={currentFloorId}
            />
        </div>
    );
};

export default TableMap;