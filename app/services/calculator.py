from app.schemas.score import ScoreRequest, ScoreResponse, Classification, GroupScore, ScoreExplanation, FinancialInsights, PersonalizedRecommendation, FinancialProgress, FinancialProgressItem
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

    # Data Consistency Check
    is_consistent = True
    inconsistent_reason = None
    
    # c31 = Chi tiêu > 85% (500), c32 = Tiết kiệm >= 10% (900)
    if data.answers.get("c31") == 500 and data.answers.get("c32") == 900:
        is_consistent = False
        inconsistent_reason = "Tỷ lệ chi tiêu thiết yếu lớn hơn 85% nhưng khai báo tích lũy trên 10% (vượt quá 100% thu nhập thực tế)."
    # c41 = Số dư ~0 > 7 ngày (400), c32 = Tiết kiệm >= 10% (900)
    elif data.answers.get("c41") == 400 and data.answers.get("c32") == 900:
        is_consistent = False
        inconsistent_reason = "Số dư thường xuyên tiệm cận 0 VNĐ nhưng khai báo có tích lũy cao."

    # Data Confidence Logic
    data_confidence = "Low"
    data_confidence_reason = "Chủ yếu dựa trên dữ liệu tự khai báo hoặc có điểm chưa nhất quán."
    
    if is_consistent:
        if data.verification_status == "Verified":
            data_confidence = "High"
            data_confidence_reason = "Dữ liệu đầy đủ, nhất quán, có khả năng xác minh tốt."
        elif data.verification_status == "Partially Verified":
            data_confidence = "Medium"
            data_confidence_reason = "Một phần dữ liệu được xác minh hoặc còn thiếu."
        elif data.verification_status == "Self-reported":
            data_confidence = "Low"
            data_confidence_reason = "Chủ yếu dựa trên dữ liệu tự khai báo hoặc có điểm chưa nhất quán."
    else:
        data_confidence = "Low"
        data_confidence_reason = "Phát hiện dữ liệu khai báo chưa nhất quán."

    # Mock data generation for new features based on scores
    strengths = []
    improvements = []
    impacts = {}
    
    cash_flow_score = group_scores_result.get("g1", GroupScore(title="", score=0)).score
    payment_score = group_scores_result.get("g2", GroupScore(title="", score=0)).score
    spending_score = group_scores_result.get("g3", GroupScore(title="", score=0)).score
    risk_score = group_scores_result.get("g4", GroupScore(title="", score=0)).score

    if cash_flow_score >= 800:
        strengths.append("Dòng tiền tương đối ổn định.")
    else:
        improvements.append("Dòng tiền có sự biến động.")

    if spending_score >= 800:
        strengths.append("Có khả năng duy trì tiết kiệm tốt.")
    else:
        improvements.append("Chi tiêu linh hoạt còn cao.")
        
    if risk_score < 700:
        improvements.append("Một số tháng số dư cuối kỳ thấp.")

    if not strengths:
        strengths.append("Có ý thức quản lý tài chính cơ bản.")
    if not improvements:
        improvements.append("Tiếp tục duy trì thói quen tốt hiện tại.")

    impacts["Cash Flow"] = f"+{round(cash_flow_score * 0.35)}"
    impacts["Payment Discipline"] = f"+{round(payment_score * 0.30)}"
    impacts["Spending Behavior"] = f"+{round(spending_score * 0.20)}"
    impacts["Risk Indicators"] = f"+{round(risk_score * 0.15)}"

    score_explanation = ScoreExplanation(
        strengths=strengths,
        improvements=improvements,
        impacts=impacts
    )

    financial_insights = FinancialInsights(
        current_status="Khá ổn định" if green_score >= 650 else "Cần chú ý",
        strengths="Dòng tiền ổn định và có khả năng tiết kiệm." if cash_flow_score >= 700 else "Khả năng thanh toán cơ bản.",
        risks="Chi tiêu linh hoạt tăng vào cuối tháng." if spending_score < 700 else "Không có rủi ro lớn.",
        priority="Trung bình" if green_score >= 650 else "Cao"
    )

    recommendations = []
    if spending_score < 700:
        recommendations.append(PersonalizedRecommendation(condition="Nếu chi tiêu cao:", action="Theo dõi nhóm chi tiêu linh hoạt trong 30 ngày tới."))
    if payment_score < 800:
        recommendations.append(PersonalizedRecommendation(condition="Nếu tiết kiệm thấp:", action="Thiết lập mục tiêu tiết kiệm cố định theo tháng."))
    if cash_flow_score < 700:
        recommendations.append(PersonalizedRecommendation(condition="Nếu dòng tiền biến động:", action="Xây dựng khoản dự phòng và theo dõi các tháng có thu nhập thấp."))
    
    if not recommendations:
        recommendations.append(PersonalizedRecommendation(condition="Tiếp tục duy trì:", action="Bạn đang quản lý tài chính rất tốt, hãy giữ vững phong độ."))

    financial_progress = FinancialProgress(
        history=[
            FinancialProgressItem(month_label="Tháng 1", score=max(0, green_score - 100)),
            FinancialProgressItem(month_label="Tháng 2", score=max(0, green_score - 40)),
            FinancialProgressItem(month_label="Tháng 3", score=green_score)
        ],
        trend="Tăng" if green_score > (green_score - 40) else "Giảm",
        changed_factors="Cải thiện tỷ lệ tiết kiệm",
        next_recommendation="Tiếp tục duy trì mức chi tiêu hiện tại"
    )

    return ScoreResponse(
        score=green_score,
        group_scores=group_scores_result,
        classification=classification,
        is_consistent=is_consistent,
        inconsistent_reason=inconsistent_reason,
        data_confidence=data_confidence,
        data_confidence_reason=data_confidence_reason,
        score_explanation=score_explanation,
        financial_insights=financial_insights,
        personalized_recommendations=recommendations,
        financial_progress=financial_progress
    )
