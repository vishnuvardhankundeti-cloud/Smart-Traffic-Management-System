import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Car,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  Filter,
  ArrowUpDown,
  Siren,
  X,
  AlertTriangle
} from 'lucide-react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getRoads } from '../services/api';

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [roadFilter, setRoadFilter] = useState('');
  const [sortBy, setSortBy] = useState('priority');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: 'CAR',
    priority: 'NORMAL',
    currentRoadId: '',
    destinationRoadId: '',
    speed: 50,
    status: 'ACTIVE'
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const [vehRes, roadsRes] = await Promise.all([
        getVehicles({ type: typeFilter || undefined, roadId: roadFilter || undefined, sortBy }),
        getRoads()
      ]);
      setVehicles(vehRes.data || []);
      setRoads(roadsRes.data || []);
    } catch (err) {
      toast.error('Failed to load vehicles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [typeFilter, roadFilter, sortBy]);

  const handleOpenAdd = () => {
    setFormData({
      registrationNumber: 'NY-' + Math.floor(1000 + Math.random() * 9000),
      vehicleType: 'CAR',
      priority: 'NORMAL',
      currentRoadId: roads[0]?.id || '',
      destinationRoadId: roads[1]?.id || '',
      speed: 50,
      status: 'ACTIVE'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      registrationNumber: v.registrationNumber,
      vehicleType: v.vehicleType,
      priority: v.priority,
      currentRoadId: v.currentRoadId || '',
      destinationRoadId: v.destinationRoadId || '',
      speed: v.speed || 50,
      status: v.status || 'ACTIVE'
    });
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, {
          ...formData,
          currentRoadId: Number(formData.currentRoadId) || null,
          destinationRoadId: Number(formData.destinationRoadId) || null
        });
        toast.success(`Vehicle ${formData.registrationNumber} updated successfully!`);
        setEditingVehicle(null);
      } else {
        await createVehicle({
          ...formData,
          currentRoadId: Number(formData.currentRoadId) || null,
          destinationRoadId: Number(formData.destinationRoadId) || null
        });
        toast.success(`Vehicle ${formData.registrationNumber} registered successfully!`);
        setShowAddModal(false);
      }
      fetchVehicles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteVehicle(deletingId);
      toast.success('Vehicle successfully removed from registry');
      setDeletingId(null);
      fetchVehicles();
    } catch (err) {
      toast.error('Failed to delete vehicle: ' + err.message);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return v.registrationNumber?.toLowerCase().includes(q) ||
           v.vehicleType?.toLowerCase().includes(q) ||
           v.currentRoadName?.toLowerCase().includes(q);
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'EMERGENCY_HIGH':
        return <span className="badge badge-red"><Siren size={11} /> CRITICAL (1)</span>;
      case 'EMERGENCY_MEDIUM':
        return <span className="badge badge-orange"><Siren size={11} /> EMERG (2)</span>;
      case 'EMERGENCY_LOW':
        return <span className="badge badge-purple"><Siren size={11} /> POLICE (3)</span>;
      case 'HIGH':
        return <span className="badge badge-yellow">BUS (4)</span>;
      case 'LOW':
        return <span className="badge badge-blue">TRUCK (6)</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>NORMAL (5)</span>;
    }
  };

  return (
    <div>
      {/* Title & Add Vehicle button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Vehicle Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Full CRUD vehicle registry with priority levels, road tracking, and real-time status.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <PlusCircle size={16} /> Register New Vehicle
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by registration, type, or road..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.2rem', height: 38 }}
            />
          </div>

          {/* Filter by Category */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', minWidth: 140, height: 38 }}
          >
            <option value="">All Vehicle Types</option>
            <option value="CAR">Car</option>
            <option value="BIKE">Bike</option>
            <option value="BUS">Bus</option>
            <option value="TRUCK">Truck</option>
            <option value="AMBULANCE">Ambulance</option>
            <option value="FIRE_ENGINE">Fire Engine</option>
            <option value="POLICE_VEHICLE">Police Vehicle</option>
          </select>

          {/* Filter by Road */}
          <select
            value={roadFilter}
            onChange={(e) => setRoadFilter(e.target.value)}
            className="form-control"
            style={{ width: 'auto', minWidth: 150, height: 38 }}
          >
            <option value="">All Roads</option>
            {roads.map(r => (
              <option key={r.id} value={r.id}>{r.roadName}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
            style={{ width: 'auto', minWidth: 130, height: 38 }}
          >
            <option value="priority">Sort: Priority</option>
            <option value="registration">Sort: Registration</option>
            <option value="entryTime">Sort: Entry Time</option>
            <option value="id">Sort: ID</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table Card */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Registration</th>
                <th>Category</th>
                <th>Current Location</th>
                <th>Destination</th>
                <th>Priority Rank</th>
                <th>Status</th>
                <th>Speed</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No matching vehicles found.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                      VEH-{String(v.id).padStart(4, '0')}
                    </td>
                    <td style={{ fontWeight: 700, letterSpacing: '0.03em' }}>
                      {v.registrationNumber}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {v.vehicleType?.includes('AMBULANCE') ? '🚑' :
                         v.vehicleType?.includes('FIRE') ? '🚒' :
                         v.vehicleType?.includes('POLICE') ? '🚓' :
                         v.vehicleType === 'BUS' ? '🚌' :
                         v.vehicleType === 'TRUCK' ? '🚚' :
                         v.vehicleType === 'BIKE' ? '🏍️' : '🚗'} {v.vehicleType}
                      </span>
                    </td>
                    <td>{v.currentRoadName || 'Transit Route'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{v.destinationRoadName || '—'}</td>
                    <td>{getPriorityBadge(v.priority)}</td>
                    <td>
                      <span className={`badge ${
                        v.status === 'EMERGENCY_TRANSIT' ? 'badge-red' :
                        v.status === 'WAITING' ? 'badge-yellow' : 'badge-green'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{v.speed} km/h</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setViewingVehicle(v)}
                        className="btn btn-secondary btn-icon"
                        style={{ width: 30, height: 30, marginRight: '0.35rem' }}
                        title="View Vehicle"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="btn btn-secondary btn-icon"
                        style={{ width: 30, height: 30, marginRight: '0.35rem' }}
                        title="Edit Vehicle"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingId(v.id)}
                        className="btn btn-danger btn-icon"
                        style={{ width: 30, height: 30 }}
                        title="Delete Vehicle"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vehicle Modal */}
      {(showAddModal || editingVehicle) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingVehicle(null); }}
                className="btn btn-secondary btn-icon"
                style={{ width: 28, height: 28, border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Registration Number</label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="form-control"
                    placeholder="e.g. NY-4921, MED-911"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Vehicle Category</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => {
                        const type = e.target.value;
                        let autoPriority = 'NORMAL';
                        if (type === 'AMBULANCE') autoPriority = 'EMERGENCY_HIGH';
                        else if (type === 'FIRE_ENGINE') autoPriority = 'EMERGENCY_MEDIUM';
                        else if (type === 'POLICE_VEHICLE') autoPriority = 'EMERGENCY_LOW';
                        else if (type === 'BUS') autoPriority = 'HIGH';
                        else if (type === 'TRUCK') autoPriority = 'LOW';
                        setFormData({ ...formData, vehicleType: type, priority: autoPriority });
                      }}
                      className="form-control"
                    >
                      <option value="CAR">Car</option>
                      <option value="BIKE">Bike</option>
                      <option value="BUS">Bus</option>
                      <option value="TRUCK">Truck</option>
                      <option value="AMBULANCE">Ambulance (Emergency)</option>
                      <option value="FIRE_ENGINE">Fire Engine (Emergency)</option>
                      <option value="POLICE_VEHICLE">Police Cruiser (Emergency)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority Level</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="form-control"
                    >
                      <option value="EMERGENCY_HIGH">EMERGENCY_HIGH (1)</option>
                      <option value="EMERGENCY_MEDIUM">EMERGENCY_MEDIUM (2)</option>
                      <option value="EMERGENCY_LOW">EMERGENCY_LOW (3)</option>
                      <option value="HIGH">HIGH - Transit (4)</option>
                      <option value="NORMAL">NORMAL (5)</option>
                      <option value="LOW">LOW - Heavy (6)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Current Road</label>
                    <select
                      value={formData.currentRoadId}
                      onChange={(e) => setFormData({ ...formData, currentRoadId: e.target.value })}
                      className="form-control"
                    >
                      <option value="">Select Road</option>
                      {roads.map(r => (
                        <option key={r.id} value={r.id}>{r.roadName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination Road</label>
                    <select
                      value={formData.destinationRoadId}
                      onChange={(e) => setFormData({ ...formData, destinationRoadId: e.target.value })}
                      className="form-control"
                    >
                      <option value="">Select Destination</option>
                      {roads.map(r => (
                        <option key={r.id} value={r.id}>{r.roadName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Speed (km/h)</label>
                    <input
                      type="number"
                      value={formData.speed}
                      onChange={(e) => setFormData({ ...formData, speed: Number(e.target.value) })}
                      className="form-control"
                      min="10"
                      max="140"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="form-control"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="WAITING">WAITING</option>
                      <option value="MOVING">MOVING</option>
                      <option value="EMERGENCY_TRANSIT">EMERGENCY_TRANSIT</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingVehicle(null); }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} /> Confirm Vehicle Deletion
              </h3>
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary btn-icon" style={{ width: 28, height: 28, border: 'none' }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to delete vehicle <strong>VEH-{String(deletingId).padStart(4, '0')}</strong> from the database? This action will immediately adjust road traffic counts and cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Vehicle Details Modal */}
      {viewingVehicle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Vehicle Inspection: {viewingVehicle.registrationNumber}
              </h3>
              <button onClick={() => setViewingVehicle(null)} className="btn btn-secondary btn-icon" style={{ width: 28, height: 28, border: 'none' }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle ID:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>VEH-{String(viewingVehicle.id).padStart(4, '0')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                <strong>{viewingVehicle.vehicleType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Priority Rank:</span>
                <div>{getPriorityBadge(viewingVehicle.priority)}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Road:</span>
                <strong>{viewingVehicle.currentRoadName || 'Unassigned'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Destination Road:</span>
                <strong>{viewingVehicle.destinationRoadName || 'Unassigned'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Average Speed:</span>
                <strong>{viewingVehicle.speed} km/h</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <strong>{viewingVehicle.status}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registration Time:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{viewingVehicle.entryTime || 'N/A'}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setViewingVehicle(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
