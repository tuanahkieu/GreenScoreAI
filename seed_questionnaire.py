import asyncio
from app.db.mongodb import get_database

async def seed():
    db = get_database()
    
    questionnaire = {
        "is_active": True,
        "groups": [
            {
                "id": "g1",
                "title": "Nhóm 1: Độ ổn định dòng tiền",
                "weight": 0.35,
                "questions": [
                    {
                        "id": "c11",
                        "title": "Tần suất thu nhập của bạn như thế nào?",
                        "options": [
                            {"label": "Đều đặn hàng tháng", "value": 900},
                            {"label": "Không cố định nhưng biến động đều", "value": 650},
                            {"label": "Ngắt quãng, bất thường", "value": 400}
                        ]
                    },
                    {
                        "id": "c12",
                        "title": "Số dư bình quân duy trì 3 tháng gần nhất?",
                        "options": [
                            {"label": "Trên 3.000.000 VNĐ", "value": 900},
                            {"label": "Từ 1.000.000 đến 3.000.000 VNĐ", "value": 700},
                            {"label": "Dưới 1.000.000 VNĐ", "value": 500}
                        ]
                    }
                ]
            },
            {
                "id": "g2",
                "title": "Nhóm 2: Kỷ luật thanh toán",
                "weight": 0.30,
                "questions": [
                    {
                        "id": "c21",
                        "title": "Thanh toán hóa đơn định kỳ (điện, nước, internet...)",
                        "options": [
                            {"label": "Thanh toán đúng hạn 100%", "value": 950},
                            {"label": "Trễ hạn 1 - 2 lần (dưới 7 ngày)", "value": 700},
                            {"label": "Trễ hạn thường xuyên hoặc bỏ trễ", "value": 400}
                        ]
                    },
                    {
                        "id": "c22",
                        "title": "Lịch sử giao dịch ví điện tử / BNPL (Mua trước trả sau)",
                        "options": [
                            {"label": "Hoàn tất đúng hạn 100%", "value": 900},
                            {"label": "Chưa từng sử dụng", "value": 700},
                            {"label": "Có lịch sử quá hạn BNPL", "value": 400}
                        ]
                    }
                ]
            },
            {
                "id": "g3",
                "title": "Nhóm 3: Hành vi chi tiêu",
                "weight": 0.20,
                "questions": [
                    {
                        "id": "c31",
                        "title": "Tỷ lệ chi tiêu thiết yếu trên Thu nhập",
                        "options": [
                            {"label": "Dưới hoặc bằng 60% thu nhập", "value": 900},
                            {"label": "Từ 61% đến 85% thu nhập", "value": 700},
                            {"label": "Trên 85% thu nhập", "value": 500}
                        ]
                    },
                    {
                        "id": "c32",
                        "title": "Tỷ lệ trích lập tiết kiệm hàng tháng",
                        "options": [
                            {"label": "Trên hoặc bằng 10% thu nhập", "value": 900},
                            {"label": "Dưới 10% thu nhập", "value": 650},
                            {"label": "Không có khoản tích lũy", "value": 400}
                        ]
                    }
                ]
            },
            {
                "id": "g4",
                "title": "Nhóm 4: Chỉ báo rủi ro",
                "weight": 0.15,
                "questions": [
                    {
                        "id": "c41",
                        "title": "Số ngày số dư tài khoản tiệm cận 0 VNĐ trong tháng",
                        "options": [
                            {"label": "Dưới hoặc bằng 2 ngày/tháng", "value": 950},
                            {"label": "Từ 3 đến 7 ngày/tháng", "value": 650},
                            {"label": "Trên 7 ngày/tháng", "value": 400}
                        ]
                    },
                    {
                        "id": "c42",
                        "title": "Cảnh báo giao dịch bất thường / Dòng tiền ảo",
                        "options": [
                            {"label": "Không phát hiện dấu hiệu bất thường", "value": 1000},
                            {"label": "Phát hiện dấu hiệu giao dịch bất thường", "value": 500}
                        ]
                    }
                ]
            }
        ]
    }
    
    await db.questionnaire.replace_one(
        {"is_active": True},
        questionnaire,
        upsert=True
    )
    print("Database seeded with default questionnaire!")

if __name__ == "__main__":
    asyncio.run(seed())
