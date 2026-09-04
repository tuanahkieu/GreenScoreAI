import React, { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';
import ScoreDashboard from '../components/ScoreDashboard';
import { ArrowRight, ArrowLeft, Calculator, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const TestArea = () => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isMonthSelected, setIsMonthSelected] = useState(false);
  
  const [questionnaire, setQuestionnaire] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && user.username === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/questionnaire');
        if (response.ok) {
          const data = await response.json();
          setQuestionnaire(data);
        } else {
          console.error('Failed to fetch questionnaire');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestionnaire();
  }, []);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    const currentGroup = questionnaire.groups[currentStep];
    const currentQuestions = currentGroup.questions.map(q => q.id);
    const isStepComplete = currentQuestions.every(q => answers[q] !== undefined);
    
    if (!isStepComplete) {
      setModalConfig({
        isOpen: true,
        title: "Chưa hoàn thành",
        message: "Vui lòng trả lời tất cả các câu hỏi trong phần này trước khi tiếp tục.",
        type: "alert",
        confirmText: "Đóng",
        onConfirm: () => setModalConfig({ isOpen: false })
      });
      return;
    }

    if (currentStep < questionnaire.groups.length - 1) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleCalculate();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCalculate = async () => {
    const totalQuestionsCount = questionnaire.groups.reduce((acc, group) => acc + group.questions.length, 0);
    if (Object.keys(answers).length < totalQuestionsCount) {
      setModalConfig({
        isOpen: true,
        title: "Thiếu thông tin",
        message: "Vui lòng trả lời đầy đủ tất cả các câu hỏi để nhận kết quả chính xác nhất.",
        type: "alert",
        confirmText: "Đóng",
        onConfirm: () => setModalConfig({ isOpen: false })
      });
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/score/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const calculatedResult = await response.json();
      setResult(calculatedResult);
      
      // LƯU LỊCH SỬ VÀO DATABASE API
      const historyRecord = {
        date: new Date().toLocaleString('vi-VN'),
        monthYear: `${selectedMonth}/${selectedYear}`,
        score: calculatedResult.score,
        tier: calculatedResult.classification.tier,
        color: calculatedResult.classification.color
      };
      
      try {
        await fetch('http://localhost:8000/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(historyRecord)
        });
      } catch (err) {
        console.error("Lỗi lưu lịch sử", err);
      }

      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Failed to calculate score:", error);
      setModalConfig({
        isOpen: true,
        title: "Lỗi kết nối",
        message: "Có lỗi xảy ra khi kết nối tới máy chủ. Vui lòng thử lại sau.",
        type: "alert",
        confirmText: "Đóng",
        onConfirm: () => setModalConfig({ isOpen: false })
      });
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setCurrentStep(0);
    setIsMonthSelected(false);
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={48} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!questionnaire || !questionnaire.groups || questionnaire.groups.length === 0) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--color-text-muted)' }}>
        Không tải được bộ câu hỏi, vui lòng liên hệ Admin.
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questionnaire.groups.reduce((acc, group) => acc + group.questions.length, 0);
  const progressPercent = (answeredCount / totalQuestions) * 100;

  const currentGroup = questionnaire.groups[currentStep];

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header className="app-header" style={{ marginBottom: '2rem' }}>
        <h1 className="app-title" style={{ fontSize: '2rem' }}>Làm bài kiểm tra</h1>
        <p className="app-subtitle">Đánh giá sức khỏe tài chính của bạn</p>
      </header>

      {result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <ScoreDashboard result={result} onReset={handleReset} />
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/history')}>
            Xem lịch sử kiểm tra
          </button>
        </div>
      ) : !isMonthSelected ? (
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>Chọn kỳ đánh giá</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Vui lòng chọn tháng và năm bạn muốn thực hiện bài kiểm tra. Nếu kỳ đánh giá này đã có dữ liệu, kết quả mới sẽ ghi đè lên kết quả cũ.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{ flex: 1 }}>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="form-select"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m.toString().padStart(2, '0')}>Tháng {m}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="form-select"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y.toString()}>Năm {y}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setIsMonthSelected(true)} style={{ padding: '0.875rem 2.5rem', fontSize: '1.1rem' }}>
            Bắt đầu làm bài <ArrowRight style={{ marginLeft: '0.5rem' }} size={18} />
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem', overflow: 'hidden' }}>
          {/* Progress Section */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Tiến độ hoàn thành</span>
              <span>{answeredCount} / {totalQuestions} câu</span>
            </div>
            <div className="progress-bg">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {questionnaire.groups.map((step, idx) => (
                <div 
                  key={step.id} 
                  style={{ 
                    flex: 1, 
                    height: '4px', 
                    borderRadius: '2px',
                    backgroundColor: idx <= currentStep ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                    transition: 'background-color 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div 
              key={currentStep}
              style={{
                animation: direction === 'forward' ? 'slideLeft 0.4s ease-out' : 'slideRight 0.4s ease-out'
              }}
            >
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-light)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                Bước {currentStep + 1}/{questionnaire.groups.length}: {currentGroup.title.split(': ')[1] || currentGroup.title}
              </h3>
              
              {currentGroup.questions.map((q) => (
                <QuestionCard 
                  key={q.id}
                  description={q.title}
                  options={q.options} 
                  selectedValue={answers[q.id]} 
                  onChange={(val) => handleAnswerChange(q.id, val)} 
                />
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '3rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '2rem'
            }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={handlePrev}
                disabled={currentStep === 0}
                style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
              >
                <ArrowLeft style={{ marginRight: '0.5rem' }} size={18} /> Quay lại
              </button>
              
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={handleNext}
                style={{ padding: '0.75rem 2rem' }}
              >
                {currentStep === questionnaire.groups.length - 1 ? (
                  <>Hoàn thành <Calculator style={{ marginLeft: '0.5rem' }} size={18} /></>
                ) : (
                  <>Tiếp theo <ArrowRight style={{ marginLeft: '0.5rem' }} size={18} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <Modal {...modalConfig} />
    </div>
  );
};

export default TestArea;
