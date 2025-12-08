require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const http = require('http');

const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const exchangeRateRoutes = require('./routes/exchangeRateRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { autoExpireUnpaidReservations } = require('./controllers/reservationController');
const { initSocket } = require('./socket');

require('./config/passport')(passport);

const app = express();

app.use(cors());
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/exchange-rate', exchangeRateRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

const startReservationExpiryJob = () => {
    const seconds = parseInt(process.env.RESERVATION_EXPIRE_POLL_SECONDS || '300', 10);
    const intervalMs = !seconds || seconds <= 0 ? 300000 : seconds * 1000;

    setInterval(async () => {
        try {
            await autoExpireUnpaidReservations();
        } catch (error) {
            console.error('Reservation expiry job error:', error);
        }
    }, intervalMs);
};

startReservationExpiryJob();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});