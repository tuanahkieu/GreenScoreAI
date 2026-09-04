from app.schemas.score import ScoreRequest, ScoreResponse, Classification, GroupScore
from app.db.mongodb import get_database

async def calculate_green_score(data: ScoreRequest) -> ScoreResponse:
    db = get_database()
    questionnaire_doc = await db.questionnaire.find_one({"is_active": True})
    
    if not questionnaire_doc or not questionnaire_doc.get("groups"):
        # Fallback to 0 if no questionnaire is found (should not happen in prod if seeded)
        return ScoreResponse(
            score=0,
            group_scores={},
            classification=Classification(
                tier="Chưa xác định",
                color="var(--color-text-muted)",
                status="Không tìm thấy cấu hình bộ câu hỏi.",
                recommendation="Vui lòng liên hệ quản trị viên."
            )
        )
    
    groups = questionnaire_doc["groups"]
    
    green_score = 0
    group_scores_result = {}
    
    for group in groups:
        group_id = group["id"]
        group_title = group["title"]
        group_weight = group["weight"]
        questions = group.get("questions", [])
        
        # Tên nhóm trên biểu đồ radar sẽ được rút gọn (bỏ chữ "Nhóm X: ")
        short_title = group_title.split(": ")[-1] if ": " in group_title else group_title
        
        if not questions:
            group_scores_result[group_id] = GroupScore(title=short_title, score=0)
            continue
            
        group_total_score = 0
        answered_count = 0
        
        for q in questions:
            q_id = q["id"]
            if q_id in data.answers:
                group_total_score += data.answers[q_id]
                answered_count += 1
                
        # Trung bình điểm của các câu hỏi trong nhóm
        avg_group_score = group_total_score / answered_count if answered_count > 0 else 0
        
        group_scores_result[group_id] = GroupScore(title=short_title, score=avg_group_score)
        green_score += avg_group_score * group_weight

    green_score = round(green_score)

    if green_score >= 800:
        classification = Classification(
            tier="Xuất sắc",
            color="var(--color-success)",
            status="Rất tốt, dòng tiền ổn định, kỷ luật thanh toán cao.",
            recommendation="Đủ điều kiện phê duyệt tự động hạn mức tín dụng vi mô tối đa (10.000.000 VNĐ) chỉ trong 3 phút."
        )
    elif green_score >= 650:
        classification = Classification(
            tier="Tốt",
            color="var(--color-info)",
            status="An toàn, thu nhập ổn định nhưng tích lũy chưa cao.",
            recommendation="Đủ điều kiện đề xuất hạn mức tín dụng tiêu chuẩn (từ 3.000.000 đến 5.000.000 VNĐ)."
        )
    elif green_score >= 500:
        classification = Classification(
            tier="Trung bình",
            color="var(--color-warning)",
            status="Cần lưu ý, chi tiêu chưa cân đối hoặc thỉnh thoảng trễ hạn hóa đơn.",
            recommendation="Kích hoạt báo cáo Financial Insights, gửi cảnh báo chi tiêu và đề xuất lộ trình cải thiện thói quen trong 30 ngày."
        )
    else:
        classification = Classification(
            tier="Cần cải thiện",
            color="var(--color-danger)",
            status="Báo động, dòng tiền không ổn định hoặc số dư thường xuyên bằng 0 VNĐ.",
            recommendation="Chưa đủ điều kiện cấp tín dụng, cung cấp miễn phí công cụ lập ngân sách và quản lý dòng tiền cá nhân."
        )

    return ScoreResponse(
        score=green_score,
        group_scores=group_scores_result,
        classification=classification
    )
