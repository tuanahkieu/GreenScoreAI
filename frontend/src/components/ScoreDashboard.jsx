import React, { useRef, useState } from 'react';
import { 
  RefreshCcw, CheckCircle2, TrendingUp, AlertCircle, 
  AlertTriangle, Download, Loader2, Info, ChevronRight,
  ShieldAlert, ShieldCheck, Shield
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ReportTemplate from './ReportTemplate';

const ScoreDashboard = ({ result, onReset }) => {
  const { 
    score, group_scores, classification, is_consistent, inconsistent_reason,
    data_confidence, data_confidence_reason,
    score_explanation, financial_insights,
    personalized_recommendations, financial_progress
  } = result;
  
  const { tier, color, status, recommendation } = classification;
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

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
      const reportElement = reportRef.current;
      reportElement.style.left = '0';
      reportElement.style.top = '0';
      reportElement.style.zIndex = '-1000';
      
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true
      });
      
      reportElement.style.left = '-9999px';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bao_Cao_Tai_Chinh_${Date.now()}.pdf`);
    } catch (err) {
      console.error("Lỗi xuất PDF", err);
      alert("Không thể xuất file PDF. Vui lòng thử lại sau.");
      if (reportRef.current) reportRef.current.style.left = '-9999px';
    } finally {
      setIsExporting(false);
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf === 'High') return 'var(--color-success)';
    if (conf === 'Medium') return 'var(--color-info)';
    return 'var(--color-warning)';
  };

  const getConfidenceIcon = (conf) => {
    if (conf === 'High') return <ShieldCheck size={20} color="var(--color-success)" />;
    if (conf === 'Medium') return <Shield size={20} color="var(--color-info)" />;
    return <ShieldAlert size={20} color="var(--color-warning)" />;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ padding: '1rem', backgroundColor: 'transparent' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>Kết quả GreenScore</h2>
        
        {/* 5.6. GreenScore Dashboard */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '3rem' }}>
          {/* Gauge Chart & Overall */}
          <div style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '220px', height: '110px', margin: '0 auto 1.5rem' }}>
              <svg viewBox="0 0 36 18" style={{ width: '100%', height: '100%' }}>
                <path d="M 2 18 A 16 16 0 0 1 34 18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" strokeLinecap="round" />
                <path d="M 2 18 A 16 16 0 0 1 34 18" fill="none" stroke={color} strokeWidth="4" strokeDasharray={strokeDasharray} strokeDashoffset="0" strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.5s ease-out' }} />
              </svg>
              <div style={{ position: 'absolute', bottom: '-10px', width: '100%', textAlign: 'center' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{score}</span>
                <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>/1000</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              {getIcon()}
              <h3 style={{ fontSize: '1.75rem', color }}>Hạng: {tier}</h3>
            </div>
            
            <div style={{ width: '100%', textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
              {group_scores && Object.values(group_scores).map((g, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{g.title}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}>{Math.round(g.score)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div style={{ flex: '1', minWidth: '250px', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 1000]} tick={false} axisLine={false} />
                <Radar name="Điểm số" dataKey="A" stroke={color} fill={color} fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5.7. Data Confidence */}
        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'left' }}>
          {!is_consistent && (
            <div style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', borderLeft: '4px solid var(--color-danger)', padding: '1rem', marginBottom: '1.5rem', borderRadius: '0 8px 8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                <AlertTriangle size={20} />
                <span>Cảnh báo Dữ liệu Không Nhất quán</span>
              </div>
              <p style={{ color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{inconsistent_reason}</p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            {getConfidenceIcon(data_confidence)}
            <h4 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)', margin: 0 }}>Mức độ tin cậy của dữ liệu</h4>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Data Confidence:</span>
            <span style={{ 
              fontSize: '1.25rem',
              color: getConfidenceColor(data_confidence),
              fontWeight: 'bold',
              padding: '0.25rem 0.75rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '20px'
            }}>
              {data_confidence.toUpperCase()}
            </span>
          </div>
          
          <p style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {data_confidence_reason}
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '0.75rem 0', textAlign: 'left', width: '30%' }}>Mức độ</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'left' }}>Ý nghĩa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.75rem 0', color: 'var(--color-success)', fontWeight: 'bold' }}>High</td>
                <td style={{ padding: '0.75rem 0' }}>Dữ liệu đầy đủ, nhất quán, có khả năng xác minh tốt</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0', color: 'var(--color-info)', fontWeight: 'bold' }}>Medium</td>
                <td style={{ padding: '0.75rem 0' }}>Một phần dữ liệu được xác minh hoặc còn thiếu</td>
              </tr>
              <tr style={{ borderBottom: 'none' }}>
                <td style={{ padding: '0.75rem 0', color: 'var(--color-warning)', fontWeight: 'bold' }}>Low</td>
                <td style={{ padding: '0.75rem 0' }}>Chủ yếu dựa trên dữ liệu tự khai báo hoặc có điểm chưa nhất quán</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 5.8. Score Explanation */}
        {score_explanation && (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'left' }}>
            <h4 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={20} /> Giải thích điểm số (Why is my score {score}?)
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <h5 style={{ color: 'var(--color-success)', marginBottom: '0.75rem' }}>Điểm mạnh</h5>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  {score_explanation.strengths.map((item, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h5 style={{ color: 'var(--color-warning)', marginBottom: '0.75rem' }}>Điểm cần cải thiện</h5>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  {score_explanation.improvements.map((item, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
                </ul>
              </div>
            </div>

            <div>
              <h5 style={{ color: 'var(--color-text-main)', marginBottom: '0.75rem', borderBottom: '1px dotted rgba(255,255,255,0.3)', paddingBottom: '0.5rem', display: 'inline-block' }}>Ảnh hưởng đến GreenScore</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                {Object.entries(score_explanation.impacts).map(([key, val], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{key}</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5.9. Financial Insights & 5.10 Personalized Recommendations */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
          {financial_insights && (
            <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)', marginBottom: '1.25rem' }}>Phân tích sức khỏe tài chính</h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Tình trạng hiện tại</span>
                <span style={{ color: 'var(--color-text-main)', fontWeight: '500' }}>{financial_insights.current_status}</span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Điểm mạnh</span>
                <span style={{ color: 'var(--color-success)', fontWeight: '500' }}>{financial_insights.strengths}</span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Rủi ro</span>
                <span style={{ color: 'var(--color-warning)', fontWeight: '500' }}>{financial_insights.risks}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Mức độ ưu tiên</span>
                <span style={{ color: financial_insights.priority === 'Cao' ? 'var(--color-danger)' : 'var(--color-info)', fontWeight: 'bold' }}>{financial_insights.priority}</span>
              </div>
            </div>
          )}

          {personalized_recommendations && (
            <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)', marginBottom: '1.25rem' }}>Khuyến nghị cá nhân hóa</h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Hệ thống đưa ra hành động dựa trên kết quả:</p>
              
              {personalized_recommendations.map((rec, i) => (
                <div key={i} style={{ marginBottom: '1.25rem' }}>
                  <span style={{ color: 'var(--color-text-main)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>{rec.condition}</span>
                  <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <ChevronRight size={18} color="var(--color-primary-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{rec.action}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5.11. Financial Progress */}
        {financial_progress && (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'left' }}>
            <h4 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Theo dõi sự cải thiện (Financial Progress)</h4>
            <p style={{ color: 'var(--color-info)', fontSize: '0.85rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>* Định hướng phát triển tính năng trong tương lai (Hiển thị bằng dữ liệu mẫu)</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                {financial_progress.history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < financial_progress.history.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>GreenScore {h.month_label}:</span>
                    <span style={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}>{h.score}</span>
                  </div>
                ))}
              </div>
              
              <div style={{ flex: '1.5', minWidth: '300px', height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financial_progress.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month_label" stroke="var(--color-text-muted)" fontSize={12} />
                    <YAxis domain={['auto', 'auto']} stroke="var(--color-text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="score" stroke="var(--color-primary-light)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-primary-light)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Xu hướng:</strong> <span style={{ color: financial_progress.trend === 'Tăng' ? 'var(--color-success)' : 'var(--color-warning)' }}>{financial_progress.trend}</span></li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Yếu tố thay đổi:</strong> {financial_progress.changed_factors}</li>
                <li><strong>Khuyến nghị tiếp theo:</strong> {financial_progress.next_recommendation}</li>
              </ul>
            </div>
          </div>
        )}

        {/* 5.12. Privacy & Disclaimer */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
          <h4 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', marginBottom: '1rem' }}>Bảo mật & Quyền riêng tư</h4>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li>Người dùng chủ động đồng ý cung cấp dữ liệu.</li>
            <li>Dữ liệu được sử dụng cho mục đích đánh giá.</li>
            <li>Không thu thập dữ liệu không cần thiết.</li>
            <li>Có giải thích về cách sử dụng dữ liệu.</li>
          </ul>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
            <p style={{ margin: 0 }}><strong>Miễn trừ trách nhiệm:</strong> GreenScore AI là công cụ đánh giá sức khỏe tài chính thử nghiệm, không phải điểm tín dụng chính thức và không thay thế hoạt động thẩm định hoặc quyết định cấp tín dụng của các tổ chức tài chính.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
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

      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <ReportTemplate ref={reportRef} result={result} />
      </div>
    </div>
  );
};

export default ScoreDashboard;
