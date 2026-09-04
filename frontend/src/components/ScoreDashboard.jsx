import React, { useRef, useState } from 'react';
import { RefreshCcw, CheckCircle2, TrendingUp, AlertCircle, AlertTriangle, Download, Loader2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ReportTemplate from './ReportTemplate';

const ScoreDashboard = ({ result, onReset }) => {
  const { score, group_scores, classification } = result;
  const { tier, color, status, recommendation } = classification;
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // Simple calculation for the arc of the gauge chart
  const arcLength = 16 * Math.PI;
  const fillPercentage = Math.min(Math.max(score / 1000, 0), 1);
  const strokeDasharray = `${fillPercentage * arcLength} ${arcLength}`;

  const getIcon = () => {
    if (score >= 800) return <CheckCircle2 size={32} color={color} />;
    if (score >= 650) return <TrendingUp size={32} color={color} />;
    if (score >= 500) return <AlertTriangle size={32} color={color} />;
    return <AlertCircle size={32} color={color} />;
  };

  const radarData = group_scores ? Object.values(group_scores).map(g => ({
    subject: g.title,
    A: g.score,
    fullMark: 1000
  })) : [];

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Khôi phục hiển thị tạm thời để html2canvas có thể capture đầy đủ
      const reportElement = reportRef.current;
      reportElement.style.left = '0';
      reportElement.style.top = '0';
      reportElement.style.zIndex = '-1000'; // Giấu sau các element khác
      
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true
      });
      
      // Giấu lại
      reportElement.style.left = '-9999px';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bao_Cao_Tài_Chính_${Date.now()}.pdf`);
    } catch (err) {
      console.error("Lỗi xuất PDF", err);
      alert("Không thể xuất file PDF. Vui lòng thử lại sau.");
      // Giấu lại nếu có lỗi
      if (reportRef.current) reportRef.current.style.left = '-9999px';
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center', width: '100%', maxWidth: '800px' }}>
      <div style={{ padding: '1rem', backgroundColor: 'transparent' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>Kết quả GreenScore</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          {/* Gauge Chart */}
          <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '200px', height: '100px', margin: '0 auto 1rem' }}>
              <svg viewBox="0 0 36 18" style={{ width: '100%', height: '100%' }}>
                <path
                  d="M 2 18 A 16 16 0 0 1 34 18"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 2 18 A 16 16 0 0 1 34 18"
                  fill="none"
                  stroke={color}
                  strokeWidth="4"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                />
              </svg>
              <div style={{ position: 'absolute', bottom: '-10px', width: '100%', textAlign: 'center' }}>
                <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{score}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              {getIcon()}
              <h3 style={{ fontSize: '1.75rem', color }}>Hạng: {tier}</h3>
            </div>
          </div>

          {/* Radar Chart */}
          <div style={{ flex: '1', minWidth: '250px', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 1000]} tick={false} axisLine={false} />
                <Radar name="Điểm số" dataKey="A" stroke={color} fill={color} fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', textAlign: 'left' }}>
          <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>Trạng thái sức khoẻ tài chính</h4>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{status}</p>
          
          <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>Đề xuất từ hệ thống</h4>
          <p style={{ color: 'var(--color-primary-light)', fontWeight: '500' }}>{recommendation}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
        <button className="btn btn-secondary" onClick={onReset} disabled={isExporting}>
          <RefreshCcw size={18} style={{ marginRight: '0.5rem' }} /> Làm lại bài kiểm tra
        </button>
        <button className="btn btn-primary" onClick={handleExportPDF} disabled={isExporting} style={{ padding: '0.75rem 1.5rem' }}>
          {isExporting ? (
            <><Loader2 size={18} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} /> Đang tạo PDF...</>
          ) : (
            <><Download size={18} style={{ marginRight: '0.5rem' }} /> Tải báo cáo PDF</>
          )}
        </button>
      </div>

      {/* Ẩn ReportTemplate đi, chỉ dùng để chụp PDF */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <ReportTemplate ref={reportRef} result={result} />
      </div>
    </div>
  );
};

export default ScoreDashboard;
