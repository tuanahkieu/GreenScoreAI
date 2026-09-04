import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, Loader2, Edit3, Settings } from 'lucide-react';

const AdminQuestionnaire = ({ onError, onSuccess }) => {
  const { token } = useAuth();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchQuestionnaire();
  }, []);

  const fetchQuestionnaire = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/questionnaire');
      if (response.ok) {
        const data = await response.json();
        setQuestionnaire(data);
      } else {
        onError("Không thể tải cấu trúc bộ câu hỏi.");
      }
    } catch (err) {
      onError("Lỗi kết nối máy chủ khi lấy bộ câu hỏi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate weights
    const totalWeight = questionnaire.groups.reduce((acc, g) => acc + parseFloat(g.weight || 0), 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      onError(`Tổng trọng số các nhóm phải bằng 1.0 (100%). Hiện tại: ${(totalWeight * 100).toFixed(0)}%`);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8000/api/questionnaire', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questionnaire)
      });
      
      if (response.ok) {
        onSuccess("Đã lưu bộ câu hỏi mới thành công!");
      } else {
        const errData = await response.json();
        onError(errData.detail || "Không thể lưu bộ câu hỏi.");
      }
    } catch (err) {
      onError("Lỗi kết nối máy chủ khi lưu.");
    } finally {
      setIsSaving(false);
    }
  };

  // State Updaters
  const addGroup = () => {
    const newGroup = {
      id: `g_${Date.now()}`,
      title: "Nhóm câu hỏi mới",
      weight: 0.1,
      questions: []
    };
    setQuestionnaire({ ...questionnaire, groups: [...questionnaire.groups, newGroup] });
  };

  const removeGroup = (gIndex) => {
    const newGroups = [...questionnaire.groups];
    newGroups.splice(gIndex, 1);
    setQuestionnaire({ ...questionnaire, groups: newGroups });
  };

  const updateGroup = (gIndex, field, value) => {
    const newGroups = [...questionnaire.groups];
    if (field === 'weight') value = parseFloat(value) || 0;
    newGroups[gIndex] = { ...newGroups[gIndex], [field]: value };
    setQuestionnaire({ ...questionnaire, groups: newGroups });
  };

  const addQuestion = (gIndex) => {
    const newGroups = [...questionnaire.groups];
    newGroups[gIndex].questions.push({
      id: `q_${Date.now()}`,
      title: "Câu hỏi mới",
      options: [
        { label: "Lựa chọn 1", value: 1000 },
        { label: "Lựa chọn 2", value: 500 }
      ]
    });
    setQuestionnaire({ ...questionnaire, groups: newGroups });
  };

  const removeQuestion = (gIndex, qIndex) => {
    const newGroups = [...questionnaire.groups];
    newGroups[gIndex].questions.splice(qIndex, 1);
    setQuestionnaire({ ...questionnaire, groups: newGroups });
  };

  const updateQuestion = (gIndex, qIndex, field, value) => {
    const newGroups = [...questionnaire.groups];
    newGroups[gIndex].questions[qIndex] = { ...newGroups[gIndex].questions[qIndex], [field]: value };
    setQuestionnaire({ ...questionnaire, groups: newGroups });
  };

  const addOption = (gIndex, qIndex) => {
    const newGroups = [...questionnaire.groups];
    newGroups[gIndex].questions[qIndex].options.push({ label: "Lựa chọn mới", value: 0 });
    setQuestionnaire({ ...questionnaire, groups: newGroups });
  };

  const removeOption = (gIndex, qIndex, oIndex) => {
    const newGroups = [...questionnaire.groups];
    newGroups[gIndex].questions[qIndex].options.splice(oIndex, 1);
    setQuestionnaire({ ...questionnaire, groups: newGroups });
  };

  const updateOption = (gIndex, qIndex, oIndex, field, value) => {
    const newGroups = [...questionnaire.groups];
    if (field === 'value') value = parseInt(value, 10) || 0;
    newGroups[gIndex].questions[qIndex].options[oIndex] = { ...newGroups[gIndex].questions[qIndex].options[oIndex], [field]: value };
    setQuestionnaire({ ...questionnaire, groups: newGroups });
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}><Loader2 className="animate-spin" /> Đang tải...</div>;
  }

  const totalWeight = questionnaire?.groups?.reduce((acc, g) => acc + (parseFloat(g.weight) || 0), 0) || 0;
  const isWeightValid = Math.abs(totalWeight - 1.0) <= 0.01;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)' }}>Cấu trúc Bộ câu hỏi</h2>
          <p style={{ fontSize: '0.9rem', color: isWeightValid ? 'var(--color-success)' : 'var(--color-danger)' }}>
            Tổng trọng số hiện tại: {(totalWeight * 100).toFixed(0)}% (Yêu cầu: 100%)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={addGroup} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Thêm nhóm
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} style={{ marginRight: '0.5rem' }} />} Lưu thay đổi
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questionnaire?.groups?.map((group, gIndex) => (
          <div key={group.id} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
            {/* Group Header */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <input 
                className="form-select" 
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', backgroundImage: 'none' }} 
                value={group.title} 
                onChange={(e) => updateGroup(gIndex, 'title', e.target.value)}
                placeholder="Tên nhóm (Vd: Nhóm 1: Dòng tiền)"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Trọng số:</span>
                <input 
                  type="number" 
                  step="0.05"
                  min="0"
                  max="1"
                  className="form-select" 
                  style={{ width: '80px', backgroundColor: 'rgba(0,0,0,0.2)', backgroundImage: 'none' }} 
                  value={group.weight} 
                  onChange={(e) => updateGroup(gIndex, 'weight', e.target.value)}
                />
              </div>
              <button 
                className="btn" 
                style={{ backgroundColor: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', padding: '0.5rem' }}
                onClick={() => removeGroup(gIndex)}
                title="Xóa nhóm"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Questions List */}
            <div style={{ marginLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {group.questions.map((q, qIndex) => (
                <div key={q.id} style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input 
                      className="form-select" 
                      style={{ flex: 1, backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' }} 
                      value={q.title} 
                      onChange={(e) => updateQuestion(gIndex, qIndex, 'title', e.target.value)}
                      placeholder="Nội dung câu hỏi"
                    />
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'transparent', color: 'var(--color-danger)', padding: '0.5rem' }}
                      onClick={() => removeQuestion(gIndex, qIndex)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Options List */}
                  <div style={{ marginLeft: '1.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Các lựa chọn & Điểm số (0-1000):</div>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <input 
                          className="form-select" 
                          style={{ flex: 1, padding: '0.4rem 0.8rem', fontSize: '0.9rem', backgroundImage: 'none', backgroundColor: 'transparent' }} 
                          value={opt.label} 
                          onChange={(e) => updateOption(gIndex, qIndex, oIndex, 'label', e.target.value)}
                          placeholder="Nhãn (Vd: Tốt)"
                        />
                        <input 
                          type="number" 
                          className="form-select" 
                          style={{ width: '90px', padding: '0.4rem 0.8rem', fontSize: '0.9rem', backgroundImage: 'none', backgroundColor: 'transparent' }} 
                          value={opt.value} 
                          onChange={(e) => updateOption(gIndex, qIndex, oIndex, 'value', e.target.value)}
                        />
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.2rem' }}
                          onClick={() => removeOption(gIndex, qIndex, oIndex)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}
                      onClick={() => addOption(gIndex, qIndex)}
                    >
                      <Plus size={14} style={{ marginRight: '0.25rem' }} /> Thêm lựa chọn
                    </button>
                  </div>
                </div>
              ))}
              
              <button 
                className="btn btn-secondary" 
                style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => addQuestion(gIndex)}
              >
                <Plus size={14} style={{ marginRight: '0.5rem' }} /> Thêm câu hỏi
              </button>
            </div>
          </div>
        ))}
        {questionnaire?.groups?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            Chưa có nhóm câu hỏi nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestionnaire;
