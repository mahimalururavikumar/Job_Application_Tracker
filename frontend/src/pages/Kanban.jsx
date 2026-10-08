import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ApplicationModal from '../components/ApplicationModal';
import { applicationService } from '../services/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, Calendar, ExternalLink, MapPin, DollarSign, Edit2, Trash2, 
  RefreshCw, ChevronLeft, ChevronRight, Clock, AlertCircle 
} from 'lucide-react';

const COLUMNS = [
  { id: 'Wishlist', title: 'Wishlist / Saved', color: 'border-t-gray-500 bg-gray-500/10 text-gray-300' },
  { id: 'Applied', title: 'Applied', color: 'border-t-blue-500 bg-blue-500/10 text-blue-300' },
  { id: 'Interview', title: 'Interviewing', color: 'border-t-amber-500 bg-amber-500/10 text-amber-300' },
  { id: 'Offer', title: 'Offer Received 🎉', color: 'border-t-emerald-500 bg-emerald-500/10 text-emerald-300' },
  { id: 'Rejected', title: 'Rejected', color: 'border-t-rose-500 bg-rose-500/10 text-rose-300' },
];

const Kanban = () => {
  const [columnsData, setColumnsData] = useState({
    Wishlist: [],
    Applied: [],
    Interview: [],
    Offer: [],
    Rejected: [],
  });

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [targetStatus, setTargetStatus] = useState('Applied');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getAll({ limit: 200 }); // fetch all for kanban
      const grouped = {
        Wishlist: [],
        Applied: [],
        Interview: [],
        Offer: [],
        Rejected: [],
      };
      res.items.forEach((item) => {
        if (grouped[item.status]) {
          grouped[item.status].push(item);
        } else {
          grouped.Applied.push(item);
        }
      });
      setColumnsData(grouped);
    } catch (err) {
      console.error("Failed to load kanban items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;
    const appId = parseInt(draggableId, 10);

    // Optimistic UI Update
    const sourceItems = Array.from(columnsData[sourceColId]);
    const destItems = sourceColId === destColId ? sourceItems : Array.from(columnsData[destColId]);
    
    const [movedApp] = sourceItems.splice(source.index, 1);
    const updatedApp = { ...movedApp, status: destColId };

    if (sourceColId === destColId) {
      sourceItems.splice(destination.index, 0, updatedApp);
      setColumnsData({ ...columnsData, [sourceColId]: sourceItems });
    } else {
      destItems.splice(destination.index, 0, updatedApp);
      setColumnsData({
        ...columnsData,
        [sourceColId]: sourceItems,
        [destColId]: destItems,
      });
    }

    // Backend Persist
    try {
      await applicationService.update(appId, { status: destColId });
    } catch (err) {
      console.error("Failed to update status on drag drop:", err);
      fetchApplications(); // revert if failed
    }
  };

  const handleQuickMove = async (app, newStatus) => {
    try {
      await applicationService.update(app.id, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddModal = (status = 'Applied') => {
    setEditingApp(null);
    setTargetStatus(status);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    if (editingApp) {
      await applicationService.update(editingApp.id, formData);
    } else {
      await applicationService.create(formData);
    }
    fetchApplications();
  };

  const handleDelete = async (id, company) => {
    if (window.confirm(`Delete application for ${company}?`)) {
      try {
        await applicationService.delete(id);
        fetchApplications();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 pb-16">
      <Navbar onOpenAddModal={() => handleOpenAddModal('Applied')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Kanban Pipeline Board
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Drag and drop applications across status columns to update your progress.
            </p>
          </div>

          <button
            onClick={() => handleOpenAddModal('Applied')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Application</span>
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
            <p className="text-gray-400 text-sm mt-3">Loading kanban board...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pt-2">
              
              {COLUMNS.map((col) => {
                const items = columnsData[col.id] || [];
                return (
                  <div
                    key={col.id}
                    className={`glass-panel rounded-2xl p-4 border-t-4 ${col.color.split(' ')[0]} flex flex-col max-h-[80vh] overflow-hidden`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{col.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.color}`}>
                          {items.length}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenAddModal(col.id)}
                        title={`Add application to ${col.title}`}
                        className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Droppable Area */}
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 overflow-y-auto space-y-3 pr-1 min-h-[150px] transition-colors rounded-xl p-1 ${
                            snapshot.isDraggingOver ? 'bg-indigo-500/10' : ''
                          }`}
                        >
                          {items.map((app, index) => (
                            <Draggable key={app.id.toString()} draggableId={app.id.toString()} index={index}>
                              {(providedDraggable, snapshotDraggable) => (
                                <div
                                  ref={providedDraggable.innerRef}
                                  {...providedDraggable.draggableProps}
                                  {...providedDraggable.dragHandleProps}
                                  className={`glass-panel p-4 rounded-xl border border-gray-800/80 shadow-md transition-all cursor-grab active:cursor-grabbing ${
                                    snapshotDraggable.isDragging ? 'shadow-2xl border-indigo-500 scale-105 bg-gray-900/90' : 'hover:border-gray-700'
                                  }`}
                                >
                                  {/* Card Header */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="font-bold text-sm text-white leading-snug">
                                        {app.company}
                                      </h4>
                                      <p className="text-xs text-indigo-300 font-medium">
                                        {app.role}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
                                      <button
                                        onClick={() => handleOpenEditModal(app)}
                                        className="p-1 text-gray-400 hover:text-white rounded"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(app.id, app.company)}
                                        className="p-1 text-gray-400 hover:text-red-400 rounded"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Metadata */}
                                  <div className="mt-3 space-y-1.5 text-[11px] text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3 h-3 text-gray-500" />
                                      <span>Applied: {app.date_applied}</span>
                                    </div>
                                    {app.salary && (
                                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                        <DollarSign className="w-3 h-3 text-emerald-400" />
                                        <span>{app.salary}</span>
                                      </div>
                                    )}
                                    {app.follow_up_date && (
                                      <div className="flex items-center gap-1 text-amber-300 font-medium">
                                        <Clock className="w-3 h-3 text-amber-400" />
                                        <span>Follow up: {app.follow_up_date}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Job Link */}
                                  {app.link && (
                                    <div className="mt-3 pt-2 border-t border-gray-800/60 flex items-center justify-between">
                                      <a
                                        href={app.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Posting Link</span>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {items.length === 0 && !snapshot.isDraggingOver && (
                            <div className="py-8 text-center text-xs text-gray-600 border border-dashed border-gray-800 rounded-xl">
                              Drop items here
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}

            </div>
          </DragDropContext>
        )}

      </div>

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingApp}
        initialStatus={targetStatus}
      />
    </div>
  );
};

export default Kanban;
