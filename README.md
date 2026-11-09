# Smart Traffic Management System (STMS)

An enterprise-grade, full-stack intelligent traffic management and simulation web application built with **Spring Boot 3 (Java 17)**, **React 18 + Vite**, and **MySQL / Persistent H2**.

Designed to demonstrate practical implementation of **Java Collections Framework**, **Multithreading**, **Stream API**, **Dijkstra's Shortest Path Algorithm**, and **Queue Scheduling**.

---

## 🌟 Key Features

1. **Enterprise Dashboard (`/`)**:
   - Real-time KPI statistics cards with animated counters (Total Vehicles, Active Roads, Average Traffic Density, Congested Roads, Emergency Priority Count, Operational Signals).
   - 4 interactive Chart.js visualizations: Traffic Density Timeline, Fleet Category Distribution, Road Capacity Comparison, and Flow Level Polar Area.
   - Live color-coded traffic table updated continuously by background simulation.

2. **Live Traffic Monitoring (`/traffic`)**:
   - Interactive SVG-rendered topological road network graph with clickable nodes and dynamic traffic-density pulse indicators.
   - Density filters (All Roads, Low Traffic, Moderate, Heavy, Congested).

3. **Vehicle Management (`/vehicles`)**:
   - Full CRUD registry for all vehicle types (Car, Bike, Bus, Truck, Ambulance, Fire Engine, Police Cruiser).
   - Real-time search, category filtering, road filtering, priority sorting, and deletion confirmation modal.

4. **Road & Route Management (`/roads`)**:
   - Full CRUD for road corridors with capacities, speed limits, and distance metrics.
   - Graph Adjacency List visualizer demonstrating backend `HashMap<Long, List<RoadEdge>>` structure.

5. **Shortest Path & Route Optimization (`/routes`)**:
   - Implementation of **Dijkstra's Shortest Path Algorithm** with custom weight calculation based on physical distance, simulated traffic congestion, and dynamic travel times.
   - Supports 3 optimization objectives:
     1. Shortest Physical Distance
     2. Lowest Traffic & Congestion Avoidance
     3. Minimum Estimated Travel Time
   - Compares **Recommended Optimal Route** vs. **Alternative Bypass Route** side-by-side with full waypoint lists.

6. **Traffic Signal Management (`/signals`)**:
   - Realistic animated traffic lights (RED, YELLOW, GREEN) with countdown timers.
   - Manual cycle overrides and configurable signal phase timings.

7. **Emergency Vehicle Priority (`/emergency`)**:
   - Prioritizes emergency fleets (Ambulances, Fire Engines, Police) using Java `PriorityQueue<Vehicle>` and a custom `Comparator`.
   - Automatic green-wave corridor preemption setting all intermediate signals to GREEN along the fastest path.

8. **Multithreaded Simulation Engine (`/simulation`)**:
   - Concurrent traffic simulation using Java `ScheduledExecutorService` executing 5 distinct worker tasks:
     - **Thread 1 [Arrivals]**: Generates vehicle arrivals & movements.
     - **Thread 2 [Density]**: Computes road load & triggers congestion alerts.
     - **Thread 3 [Queue]**: Processes intersection waiting lines & emergency preemption.
     - **Thread 4 [Signals]**: Autonomously cycles traffic lights.
     - **Thread 5 [Analytics]**: Records historical database telemetry snapshots.
   - Controls: Start, Pause, Resume, Stop, Reset, and Speed Multiplier (1x, 2x, 5x, 10x).

9. **Analytics & Reports (`/analytics`)**:
   - Performance summaries (Total Processed, Average Wait Time, Busiest Corridor, Peak Congestion).
   - Instant CSV export for Vehicles and Roads.

10. **Theme & Settings (`/settings`)**:
    - Dark mode and Light mode toggle with persistent local storage.
    - Database connection status diagnostics.

---

## ☕ Java Concepts Demonstrated

### 1. Java Collections Framework
- **`HashMap<Long, List<RoadEdge>>`**: Implements the urban road network graph as a fast adjacency list for constant-time neighbor lookups.
- **`PriorityQueue<Vehicle>`**: Min-heap ordering vehicles based on custom emergency rank comparator (`Ambulance` > `Fire Engine` > `Police` > `Standard`).
- **`PriorityQueue<NodeDistance>`**: Greedy lowest-cost node expansion in Dijkstra's shortest path algorithm.
- **`LinkedList<Vehicle>` & `Deque`**: Intersection waiting queues with `addFirst()` for emergency preemption.
- **`HashSet<String>`**: Ensures unique road connections and prevents cyclic edge duplication.
- **`ArrayList<Road>`**: Index-based storage and sequential road processing.

### 2. Stream API Operations
- `roads.stream().filter(r -> r.getTrafficDensity() >= 75.0)`: Congested road filtering.
- `vehicles.stream().collect(Collectors.groupingBy(Vehicle::getVehicleType, Collectors.counting()))`: Category aggregation.
- `roads.stream().mapToDouble(Road::getTrafficDensity).average()`: System-wide density computation.
- `roads.stream().max(Comparator.comparingDouble(Road::getTrafficDensity))`: Peak congestion bottleneck identification.

### 3. Java Multithreading & Concurrency
- `ScheduledExecutorService` thread pool with 5 concurrent worker tasks.
- `AtomicBoolean`, `AtomicInteger`, and `AtomicLong` for lock-free state synchronization.
- Thread-safe synchronization wrappers and `ConcurrentHashMap` for cross-thread data consistency.

---

## 🛠️ Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.5** (Web, Data JPA, Validation)
- **Hibernate / Jakarta Persistence**
- **MySQL / Persistent H2** (MySQL Compatibility Mode)
- **Apache Maven 3.9**

### Frontend
- **React 18** + **Vite 5**
- **React Router DOM 6**
- **React Context API** (ThemeContext, SimulationContext)
- **Chart.js 4** + **react-chartjs-2**
- **Lucide React Icons**
- **React Hot Toast**
- **Axios**
- **Modern Vanilla CSS** (Dark & Light themes, Glassmorphism, CSS Transitions)

---

## 🚀 Running the Application

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher (Node 20 recommended)
- Maven 3.8+ (or Maven wrapper)
- *(Optional)* MySQL Server (if using external MySQL instead of persistent H2)

### 1. Start the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
*The backend will start at `http://localhost:8080`. By default, it initializes 10 intersections, 16 roads, 32 vehicles, and 10 traffic signals.*

#### MySQL Configuration:
To connect to a live MySQL database, configure `backend/src/main/resources/application-mysql.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_traffic_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```
Run with profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend dashboard will be available at `http://localhost:5173`.*

---

## 📡 REST API Reference

All endpoints are prefixed with `/api`.

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Vehicles** | `GET` | `/api/vehicles` | List vehicles (with filter & sort) |
| | `GET` | `/api/vehicles/{id}` | Get vehicle by ID |
| | `POST` | `/api/vehicles` | Register new vehicle |
| | `PUT` | `/api/vehicles/{id}` | Update vehicle |
| | `DELETE` | `/api/vehicles/{id}` | Remove vehicle |
| **Roads** | `GET` | `/api/roads` | List all roads |
| | `POST` | `/api/roads` | Add new road corridor |
| | `PUT` | `/api/roads/{id}` | Update road corridor |
| | `DELETE` | `/api/roads/{id}` | Delete road corridor |
| **Routes** | `POST` | `/api/routes/shortest-path` | Compute Dijkstra optimal path |
| | `POST` | `/api/routes/optimize` | Dynamic rerouting |
| | `GET` | `/api/routes/history` | View route calculation history |
| **Traffic** | `GET` | `/api/traffic/overview` | KPI counters & live road metrics |
| | `GET` | `/api/traffic/density` | Road density map |
| | `GET` | `/api/traffic/congested-roads`| Congested corridors list |
| **Signals** | `GET` | `/api/signals` | List all simulated traffic signals |
| | `POST` | `/api/signals/{id}/cycle` | Manually cycle light state |
| | `PUT` | `/api/signals/{id}` | Update timing configuration |
| **Emergency** | `GET` | `/api/emergency/priority-queue`| Inspect PriorityQueue min-heap |
| | `POST` | `/api/emergency/vehicles` | Dispatch emergency vehicle |
| | `POST` | `/api/emergency/{id}/resolve` | Mark mission completed |
| **Simulation**| `POST` | `/api/simulation/start` | Start 5 concurrent threads |
| | `POST` | `/api/simulation/pause` | Pause simulation engine |
| | `POST` | `/api/simulation/resume` | Resume simulation engine |
| | `POST` | `/api/simulation/stop` | Stop all worker threads |
| | `POST` | `/api/simulation/reset` | Restore baseline dataset |
| | `POST` | `/api/simulation/speed/{x}` | Adjust speed (1x to 10x) |
| | `GET` | `/api/simulation/status` | Real-time thread telemetry |
| | `GET` | `/api/simulation/logs` | Real-time activity log stream |
| **Analytics** | `GET` | `/api/analytics/summary` | Complete analytical aggregations |
| | `GET` | `/api/analytics/export/vehicles` | Download Vehicles CSV report |
| | `GET` | `/api/analytics/export/roads` | Download Roads CSV report |

---

## 🔒 Note on Educational Use
This is an educational traffic management simulation. It does not connect to or control actual public-road infrastructure.
