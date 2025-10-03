# Real-Time Delivery Tracker 🚀

A modern real-time delivery tracking application similar to Blinkit, Zomato, and other delivery platforms. Built with React, Node.js, Socket.IO, and MongoDB.

## Features ✨

### Customer View
- **Real-time tracking** of delivery partner location on interactive map
- **Live status updates** with delivery timeline
- **Estimated delivery time** with dynamic updates
- **Delivery partner information** (name, rating, vehicle details)
- **Order summary** with items and total
- **Route visualization** showing pickup and delivery locations
- **Modern UI/UX** similar to popular delivery apps

### Delivery Partner Dashboard
- **Order management** with customer details
- **Status updates** (Pickup, Delivering, Delivered)
- **Location simulation** for testing
- **Online/Offline status** toggle
- **Testing tools** for delivery simulation

### Backend Features
- **Socket.IO integration** for real-time communication
- **MongoDB database** for order persistence
- **RESTful API** for order management
- **Location tracking** with status updates
- **Order status management** throughout delivery lifecycle

## Tech Stack 🛠️

- **Frontend**: React 19, Leaflet Maps, Socket.IO Client, Lucide Icons
- **Backend**: Node.js, Express, Socket.IO, MongoDB
- **Real-time**: WebSocket connections via Socket.IO
- **Maps**: OpenStreetMap with React Leaflet
- **Styling**: CSS3 with modern design patterns

## Quick Start 🚀

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-time-delivery-tracker
   ```

2. **Install frontend dependencies**
   ```bash
   cd real-time
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Configure MongoDB**
   - Update `server/config.js` with your MongoDB connection string
   - Or use the provided cloud MongoDB instance

5. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:5000`

6. **Start the frontend application**
   ```bash
   cd real-time
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## Usage 📱

### Customer Experience
1. Open the app and you'll see the customer tracking view
2. Watch real-time location updates on the map
3. View delivery status progression
4. See estimated delivery time updates
5. Access delivery partner contact information

### Delivery Partner Experience
1. Switch to "Delivery Partner" view using the toggle
2. Update order status (Pickup → Delivering → Delivered)
3. Toggle online/offline status
4. Use simulation tools for testing

### Testing the System
1. Use the "Start Delivery Simulation" button in partner dashboard
2. Watch the customer view update in real-time
3. See location changes and status updates
4. Observe estimated time adjustments

## API Endpoints 🔗

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders` - Get all orders
- `POST /api/orders/update-location` - Update delivery location
- `PUT /api/orders/:orderId/status` - Update order status
- `PUT /api/orders/:orderId/assign` - Assign delivery partner

### Testing
- `POST /api/simulate-delivery/:orderId` - Start delivery simulation

## Socket Events 📡

### Client → Server
- `update-location` - Send location updates
- `update-status` - Send status changes
- `join-order` - Join order-specific room
- `leave-order` - Leave order room

### Server → Client
- `location-{orderId}` - Real-time location updates
- `status-{orderId}` - Status change notifications

## Project Structure 📁

```
real-time-delivery-tracker/
├── real-time/                 # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeliveryTracker.jsx
│   │   │   ├── DeliveryTracker.css
│   │   │   ├── DeliveryPartnerDashboard.jsx
│   │   │   └── DeliveryPartnerDashboard.css
│   │   ├── App.jsx
│   │   └── socket.js
│   └── package.json
├── server/                    # Backend Node.js app
│   ├── controllers/
│   │   └── orderController.js
│   ├── models/
│   │   └── Order.js
│   ├── routes/
│   │   └── orderRoutes.js
│   ├── config.js
│   ├── server.js
│   └── package.json
└── README.md
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements 🚀

- [ ] Push notifications
- [ ] Multiple language support
- [ ] Advanced route optimization
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Customer ratings and reviews
- [ ] Multiple delivery partners per order
- [ ] Real GPS integration
- [ ] Payment integration
- [ ] Order scheduling

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Support 💬

For support, email support@example.com or join our Slack channel.

---

**Made with ❤️ for modern delivery experiences**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
