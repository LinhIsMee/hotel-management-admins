const menu = [
    // các mục menu khác...
    {
        label: 'Quản lý đặt phòng',
        icon: 'pi pi-calendar',
        to: '/admin/bookings',
        roles: ['admin', 'manager', 'receptionist']
    },
    {
        label: 'Quản lý mã giảm giá',
        icon: 'pi pi-tag',
        to: '/admin/discounts',
        roles: ['admin', 'manager']
    },
    // các mục menu khác...
];

export default menu;
