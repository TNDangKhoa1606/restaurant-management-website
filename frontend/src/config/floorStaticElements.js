// Cấu hình các phần tử tĩnh trên sơ đồ bàn: sân khấu, WC, cửa ra vào, lối thoát hiểm
// Toạ độ dùng theo %, trùng với hệ trục trong TableMap.css

const floorStaticElements = {
    1: [
        {
            id: 'entrance-1',
            type: 'static',
            label: 'Cửa ra vào',
            pos_x: 8,
            pos_y: 92,
            width: 18,
            height: 8,
        },
        {
            id: 'wc-1',
            type: 'static',
            label: 'WC',
            pos_x: 92,
            pos_y: 10,
            width: 12,
            height: 14,
        },
        {
            id: 'stage-1',
            type: 'static',
            label: 'Sân khấu',
            pos_x: 92,
            pos_y: 55,
            width: 12,
            height: 40,
        },
        {
            id: 'exit-1',
            type: 'static',
            label: 'Lối thoát hiểm',
            pos_x: 92,
            pos_y: 92,
            width: 12,
            height: 8,
        },
    ],
    2: [
        {
            id: 'entrance-2',
            type: 'static',
            label: 'Cửa ra vào',
            pos_x: 10,
            pos_y: 90,
            width: 20,
            height: 8,
        },
        {
            id: 'wc-2',
            type: 'static',
            label: 'WC',
            pos_x: 92,
            pos_y: 10,
            width: 12,
            height: 14,
        },
        {
            id: 'stage-2',
            type: 'static',
            label: 'Sân khấu',
            pos_x: 92,
            pos_y: 55,
            width: 12,
            height: 40,
        },
        {
            id: 'exit-2',
            type: 'static',
            label: 'Lối thoát hiểm',
            pos_x: 90,
            pos_y: 90,
            width: 12,
            height: 8,
        },
    ],
};

export default floorStaticElements;
