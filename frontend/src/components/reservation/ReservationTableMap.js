import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../../pages/staff/serve/TableMap.css';
import floorStaticElements from '../../config/floorStaticElements';

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

const PlanElement = ({ element, isSelected, onSelect, disabledReason }) => {
    const style = {
        left: `${element.pos_x}%`,
        top: `${element.pos_y}%`,
    };

    if (element.type === 'static') {
        return (
            <div className="static-element" style={{ ...style, width: `${element.width}%`, height: `${element.height}%` }}>
                {element.label}
            </div>
        );
    }

    const statusInfo = statusMap[element.status] || statusMap.free;
    const shapeClass = getShapeByCapacity(element.capacity);
    const isDisabled = !!disabledReason;

    const handleClick = () => {
        if (isDisabled) return;
        onSelect(element);
    };

    const classes = [
        'node',
        shapeClass,
        statusInfo.className,
        isDisabled ? 'disabled-node' : 'selectable-node',
        isSelected ? 'node-selected' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={classes}
            style={style}
            onClick={handleClick}
            title={disabledReason || `Chọn bàn ${element.table_name}`}
        >
            <div className="node-label">
                <span className="node-code">{element.table_name}</span>
                <div className="node-capacity-group">
                    <i className="fas fa-user-friends" />
                    <span className="node-capacity">{element.capacity}</span>
                </div>
            </div>
        </div>
    );
};

const ReservationTableMap = ({ date, time, guests, selectedTableId, onSelectTable }) => {
    const [floors, setFloors] = useState([]);
    const [currentFloorId, setCurrentFloorId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!date || !time || !guests) {
            setFloors([]);
            setCurrentFloorId(null);
            return;
        }

        const fetchLayout = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get('/api/reservations/layout', {
                    params: { date, time, guests },
                });

                const withStatic = data.map((floor) => {
                    const staticElements = floorStaticElements[floor.floor_id] || [];
                    return {
                        ...floor,
                        elements: [
                            ...(floor.elements || []),
                            ...staticElements,
                        ],
                    };
                });

                setFloors(withStatic);
                if (withStatic.length > 0) {
                    setCurrentFloorId(withStatic[0].floor_id);
                }
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải sơ đồ bàn.');
            } finally {
                setLoading(false);
            }
        };

        fetchLayout();
    }, [date, time, guests]);

    const floorData = useMemo(() => {
        return floors.find((f) => f.floor_id === currentFloorId) || { name: '', elements: [] };
    }, [floors, currentFloorId]);

    const getDisabledReason = (element) => {
        if (element.type === 'static') return '';
        if (element.status === 'reserved') {
            return 'Bàn này đã có người đặt trong khung giờ này.';
        }
        if (element.status === 'occupied') {
            return 'Bàn này đang có khách sử dụng.';
        }
        if (!element.suitable) {
            return 'Bàn này không phù hợp với số khách. Vui lòng chọn bàn theo gợi ý.';
        }
        return '';
    };

    if (!date || !time || !guests) {
        return <p>Vui lòng chọn ngày, giờ và số lượng khách để hiển thị sơ đồ bàn.</p>;
    }

    return (
        <div className="table-map-container">
            <div className="map-toolbar">
                <h3 className="table-map-title">Chọn bàn trên sơ đồ</h3>
                <div className="segment">
                    {floors.map((floor) => (
                        <button
                            key={floor.floor_id}
                            type="button"
                            className={`seg-btn ${currentFloorId === floor.floor_id ? 'active' : ''}`}
                            onClick={() => setCurrentFloorId(floor.floor_id)}
                        >
                            {floor.name}
                        </button>
                    ))}
                </div>
                <div className="legend">
                    <span className="legend-item legend-vacant">Bàn trống phù hợp</span>
                    <span className="legend-item legend-checked">Đã đặt</span>
                    <span className="legend-item legend-occupied">Đang phục vụ</span>
                </div>
            </div>

            {loading && <div className="loading-overlay">Đang tải sơ đồ bàn...</div>}
            {error && <div className="error-overlay">{error}</div>}

            {!loading && !error && (
                <div className="floor-plan-area">
                    {floorData.elements.map((element) => {
                        const disabledReason = getDisabledReason(element);
                        return (
                            <PlanElement
                                key={element.table_id || element.id}
                                element={element}
                                isSelected={
                                    !!selectedTableId &&
                                    element.table_id &&
                                    element.table_id === selectedTableId
                                }
                                onSelect={onSelectTable}
                                disabledReason={disabledReason}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReservationTableMap;
