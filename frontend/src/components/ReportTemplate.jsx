import React, { forwardRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const ReportTemplate = forwardRef(({ result }, ref) => {
  const { score, group_scores, classification } = result;
  const { tier, color, status, recommendation } = classification;

  const radarData = group_scores ? Object.values(group_scores).map(g => ({
    subject: g.title,
    A: g.score,
    fullMark: 1000
  })) : [];

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div 
      ref={ref}
      style={{
        width: '800px', // Khổ A4 (xấp xỉ)
        minHeight: '1131px', 
        backgroundColor: '#FFFFFF',
        color: '#1E293B', // Màu chữ Slate 800
        padding: '40px 50px',
        fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box',
        position: 'absolute',
        left: '-9999px',
        top: 0
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E2E8F0', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#0F172A', fontWeight: '800' }}>GreenScore AI</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748B', fontSize: '14px' }}>Nền tảng đánh giá sức khỏe tài chính thông minh</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#334155' }}>BÁO CÁO CÁ NHÂN</h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748B', fontSize: '14px' }}>Ngày lập: {currentDate}</p>
        </div>
      </div>

      {/* Điểm tổng quan */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
        <div style={{ 
          flex: '0 0 250px', 
          backgroundColor: '#F8FAFC', 
          border: '1px solid #E2E8F0',
          borderRadius: '16px', 
          padding: '30px 20px', 
          textAlign: 'center' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#475569' }}>Điểm GreenScore</h3>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: color, lineHeight: '1' }}>{score}</div>
          <div style={{ marginTop: '15px', display: 'inline-block', backgroundColor: `${color}20`, color: color, padding: '8px 20px', borderRadius: '24px', fontWeight: 'bold', fontSize: '18px' }}>
            Hạng: {tier}
          </div>
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#0F172A' }}>Tóm tắt tình trạng</h3>
          <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', color: '#334155' }}>
            {status}
          </p>
        </div>
      </div>

      {/* Phân tích Biểu đồ & Chi tiết */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        <div style={{ flex: '1' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>Biểu đồ thành phần</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#CBD5E1" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 14, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 1000]} tick={false} axisLine={false} />
                <Radar name="Điểm số" dataKey="A" stroke={color} fill={color} fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ flex: '1' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>Chi tiết các chỉ số</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {group_scores && Object.values(group_scores).map((g, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{g.title}</span>
                  <span style={{ fontWeight: 'bold', color: '#0F172A' }}>{Math.round(g.score)}/1000</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(g.score / 1000) * 100}%`, height: '100%', backgroundColor: color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lời khuyên hệ thống */}
      <div style={{ backgroundColor: '#F8FAFC', borderLeft: `4px solid ${color}`, padding: '25px', borderRadius: '0 12px 12px 0', marginBottom: '50px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#0F172A' }}>Đề xuất từ chuyên gia AI</h3>
        <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', color: '#1E293B' }}>
          {recommendation}
        </p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '20px', color: '#94A3B8', fontSize: '12px' }}>
        <p style={{ margin: '0 0 5px 0' }}>Tài liệu này được tạo tự động bởi thuật toán nội bộ của GreenScore AI.</p>
        <p style={{ margin: 0 }}>Vui lòng không sử dụng báo cáo này làm cơ sở pháp lý duy nhất cho các quyết định tín dụng lớn.</p>
      </div>
    </div>
  );
});

export default ReportTemplate;
