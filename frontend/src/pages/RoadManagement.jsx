import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Milestone,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  GitBranch,
  X,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { getRoads, createRoad, updateRoad, deleteRoad, getIntersections } from '../services/api';

export default function RoadManagement() {
  const [roads, setRoads] = useState([]);
  const [intersections, setIntersections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoad, setEditingRoad] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    roadName: '',
    startIntersectionId: '',
    endIntersectionId: '',
    distanceKm: 2.5,
    maxCapacity: 120,
    currentVehicleCount: 20,
    speedLimit: 60
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [roadsRes, interRes] = await Promise.all([getRoads(), getIntersections()]);
      setRoads(roadsRes.data || []);
      setIntersections(interRes.data || []);
    } catch (err) {
      toast.error('Failed to load roads: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      roadName: '',
      startIntersectionId: intersections[0]?.id || '',
      endIntersectionId: intersections[1]?.id || '',
      distanceKm: 2.5,
      maxCapacity: 120,
      currentVehicleCount: 15,
      speedLimit: 60
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (road) => {
    setEditingRoad(road);
    setFormData({
      roadName: road.roadName,
      startIntersectionId: road.startIntersectionId,
      endIntersectionId: road.endIntersectionId,
      distanceKm: road.distanceKm,
      maxCapacity: road.maxCapacity,
      currentVehicleCount: road.currentVehicleCount,
      speedLimit: road.speedLimit || 60
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.startIntersectionId === formData.endIntersectionId) {
      toast.error('Starting and ending intersections cannot be the same!');
      return;
    }
    try {
      if (editingRoad) {
        await updateRoad(editingRoad.id, {
          ...formData,
          startIntersectionId: Number(formData.startIntersectionId),
          endIntersectionId: Number(formData.endIntersectionId),
          distanceKm: Number(formData.distanceKm),
          maxCapacity: Number(formData.maxCapacity),
          currentVehicleCount: Number(formData.currentVehicleCount),
          speedLimit: Number(formData.speedLimit)
        });
        toast.success(`Road ${formData.roadName} updated! Graph adjacency updated.`);
        setEditingRoad(null);
      } else {
        await createRoad({
          ...formData,
          startIntersectionId: Number(formData.startIntersectionId),
          endIntersectionId: Number(formData.endIntersectionId),
          distanceKm: Number(formData.distanceKm),
          maxCapacity: Number(formData.maxCapacity),
          currentVehicleCount: Number(formData.currentVehicleCount),
          speedLimit: Number(formData.speedLimit)
        });
        toast.success(`Road ${formData.roadName} created and integrated into graph!`);
        setShowAddModal(false);
      }
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteRoad(deletingId);
      toast.success('Road removed and graph recomputed');
      setDeletingId(null);
      loadData();
    } catch (err) {
      toast.error('Failed to delete road: ' + err.message);
    }
  };

  const filteredRoads = roads.filter(r => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return r.roadName?.toLowerCase().includes(q) ||
           r.startIntersectionName?.toLowerCase().includes(q) ||
           r.endIntersectionName?.toLowerCase().includes(q);
  });

  return (
    <div>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Road &amp; Route Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Maintain road corridors, graph adjacency connections, and capacity thresholds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <PlusCircle size={16} /> Add Road Corridor
          </button>
          <button onClick={loadData} className="btn btn-secondary btn-icon" title="Refresh">
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* Adjacency List Graph Summary Panel */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(17, 24, 39, 0.7) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <GitBranch size={20} color="#6366F1" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Backend Graph Representation: Adjacency List Structure
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Implemented using Java <code>HashMap&lt;Long, List&lt;RoadEdge&gt;&gt;</code> with duplicate avoidance via <code>HashSet</code> and weighted traversal metrics.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {intersections.map(node => {
            const outgoing = roads.filter(r => r.startIntersectionId === node.id || r.endIntersectionId === node.id);
            return (
              <div
                key={node.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.75rem'
                }}
              >
                <strong style={{ color: '#38BDF8' }}>N{node.id} ({node.intersectionName})</strong>: {outgoing.length} edges
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '380px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search road by name or intersection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.2rem', height: 38 }}
          />
        </div>
      </div>

      {/* Roads Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Road ID</th>
                <th>Corridor Name</th>
                <th>Starting Node</th>
                <th>Ending Node</th>
                <th>Distance</th>
                <th>Max Capacity</th>
                <th>Vehicles</th>
                <th>Traffic Density</th>
                <th>Average Speed</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoads.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                    RD-{String(r.id).padStart(3, '0')}
                  </td>
                  <td style={{ fontWeight: 600 }}>{r.roadName}</td>
                  <td>{r.startIntersectionName}</td>
                  <td>{r.endIntersectionName}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{r.distanceKm} km</td>
                  <td>{r.maxCapacity}</td>
                  <td style={{ fontWeight: 700 }}>{r.currentVehicleCount}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 600 }}>{r.trafficDensity}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{r.averageSpeed} km/h</td>
                  <td>
                    <span className={`badge ${
                      r.roadStatus === 'LOW' ? 'badge-green' :
                      r.roadStatus === 'MODERATE' ? 'badge-yellow' :
                      r.roadStatus === 'HEAVY' ? 'badge-orange' : 'badge-red'
                    }`}>
                      {r.roadStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className="btn btn-secondary btn-icon"
                      style={{ width: 30, height: 30, marginRight: '0.35rem' }}
                      title="Edit Road"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingId(r.id)}
                      className="btn btn-danger btn-icon"
                      style={{ width: 30, height: 30 }}
                      title="Delete Road"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Road Modal */}
      {(showAddModal || editingRoad) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingRoad ? 'Edit Road Corridor' : 'Register New Road Segment'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingRoad(null); }}
                className="btn btn-secondary btn-icon"
                style={{ width: 28, height: 28, border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Road Name</label>
                  <input
                    type="text"
                    required
                    value={formData.roadName}
                    onChange={(e) => setFormData({ ...formData, roadName: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Broadway Avenue, Outer Expressway"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Intersection (Node U)</label>
                    <select
                      required
                      value={formData.startIntersectionId}
                      onChange={(e) => setFormData({ ...formData, startIntersectionId: e.target.value })}
                      className="form-control"
                    >
                      <option value="">Select Intersection</option>
                      {intersections.map(i => (
                        <option key={i.id} value={i.id}>{i.intersectionName} (N{i.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Intersection (Node V)</label>
                    <select
                      required
                      value={formData.endIntersectionId}
                      onChange={(e) => setFormData({ ...formData, endIntersectionId: e.target.value })}
                      className="form-control"
                    >
                      <option value="">Select Intersection</option>
                      {intersections.map(i => (
                        <option key={i.id} value={i.id}>{i.intersectionName} (N{i.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={formData.distanceKm}
                      onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Speed Limit (km/h)</label>
                    <input
                      type="number"
                      min="20"
                      max="120"
                      required
                      value={formData.speedLimit}
                      onChange={(e) => setFormData({ ...formData, speedLimit: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Max Vehicle Capacity</label>
                    <input
                      type="number"
                      min="10"
                      required
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Vehicle Count</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.currentVehicleCount}
                      onChange={(e) => setFormData({ ...formData, currentVehicleCount: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingRoad(null); }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoad ? 'Update Road' : 'Add Road'}
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
                <AlertTriangle size={18} /> Delete Road Segment
              </h3>
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary btn-icon" style={{ width: 28, height: 28, border: 'none' }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to remove road <strong>RD-{String(deletingId).padStart(3, '0')}</strong>? The graph adjacency list will be dynamically rebuilt and shortest path routes recomputed.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                Delete Road
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
