import { useState } from 'react';
import { useApp, type Contact } from '../context/AppContext';
import { Plus, Trash2, Edit2, ShieldAlert, ArrowLeft, Save } from 'lucide-react';

export const ContactsScreen: React.FC = () => {
  const { contacts, addContact, deleteContact, updateContact } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Parent');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [messageTemplate, setMessageTemplate] = useState('SafeShield ALERT! I am in danger. Live location tracker: {loc}. Please assist me immediately.');

  const handleStartAdd = () => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setPhone('');
    setRelation('Parent');
    setPriority('High');
    setMessageTemplate('SafeShield ALERT! I am in danger. Live location tracker: {loc}. Please assist me immediately.');
  };

  const handleStartEdit = (c: Contact) => {
    setIsEditing(true);
    setEditingId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setRelation(c.relation);
    setPriority(c.priority);
    setMessageTemplate(c.messageTemplate);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingId) {
      updateContact({
        id: editingId,
        name,
        phone,
        relation,
        priority,
        messageTemplate
      });
    } else {
      addContact({
        name,
        phone,
        relation,
        priority,
        messageTemplate
      });
    }
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
      
      {/* Screen Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} style={{ color: '#f43f5e' }} />
          Emergency Contacts
        </h2>
        
        {!isEditing && (
          <button
            onClick={handleStartAdd}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.2)',
              color: '#f43f5e',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {isEditing ? (
        /* Edit / Create Form */
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={16} />
            </button>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
              {editingId ? 'Edit Contact Details' : 'Register New Contact'}
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '500' }}>Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Mom" style={{ padding: '8px 12px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '500' }}>Relationship</label>
              <select
                className="form-input"
                value={relation}
                onChange={e => setRelation(e.target.value)}
                style={{ padding: '8px 12px', background: '#0f172a' }}
              >
                {['Parent', 'Partner', 'Friend', 'Guardian', 'Police', 'Other'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '500' }}>Priority Alert</label>
              <select
                className="form-input"
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                style={{ padding: '8px 12px', background: '#0f172a' }}
              >
                {['High', 'Medium', 'Low'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '500' }}>Phone / SOS Number</label>
            <input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="e.g. +91 98765 43210" style={{ padding: '8px 12px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '500' }}>Custom SMS Template</label>
            <textarea
              className="form-input"
              value={messageTemplate}
              onChange={e => setMessageTemplate(e.target.value)}
              rows={3}
              style={{ resize: 'none', padding: '8px 12px', fontSize: '12px' }}
              placeholder="Custom message... Use {loc} for automatic GPS maps tracking links."
            />
            <span style={{ fontSize: '9px', color: '#64748b', marginTop: '2px', display: 'block' }}>
              Note: system automatically replaces <code>{"{loc}"}</code> with your active coordinates.
            </span>
          </div>

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '13px', marginTop: '4px' }}>
            <Save size={16} />
            <span>Save Contact</span>
          </button>
        </form>
      ) : (
        /* Contacts List Display */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '550px' }}>
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <p style={{ fontSize: '13px' }}>No emergency contacts registered yet.</p>
              <button className="btn-secondary" onClick={handleStartAdd} style={{ marginTop: '12px', fontSize: '12px', padding: '8px 16px' }}>
                Add First Contact
              </button>
            </div>
          ) : (
            contacts.map(c => (
              <div
                key={c.id}
                className="glass-panel"
                style={{
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>{c.name}</h4>
                    <span style={{
                      fontSize: '9px',
                      background: 'rgba(59,130,246,0.15)',
                      color: '#3b82f6',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      {c.relation}
                    </span>
                    {c.priority === 'High' && (
                      <span style={{
                        fontSize: '9px',
                        background: 'rgba(244,63,94,0.15)',
                        color: '#f43f5e',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        Priority 1
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{c.phone}</span>
                  <p style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                    {c.messageTemplate}
                  </p>
                </div>

                {/* CRUD Controls */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleStartEdit(c)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', padding: '6px', cursor: 'pointer', borderRadius: '6px' }}
                    title="Edit Contact"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteContact(c.id)}
                    style={{ background: 'none', border: 'none', color: '#f43f5e', padding: '6px', cursor: 'pointer', borderRadius: '6px' }}
                    title="Delete Contact"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
