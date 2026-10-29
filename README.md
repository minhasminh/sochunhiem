# SỔ CHỦ NHIỆM ĐIỆN TỬ - QUẢN LÝ CÔNG TÁC CHỦ NHIỆM TH & THCS

Hệ thống quản lý công tác chủ nhiệm điện tử chuẩn hóa dành cho trường liên cấp Tiểu học và Trung học cơ sở (TH & THCS), thiết kế theo các tiêu chuẩn và thông tư hướng dẫn của Bộ Giáo dục và Đào tạo.

---

## 📌 Tổng quan dự án

Hệ thống **Sổ Chủ Nhiệm Điện Tử** giúp số hóa toàn diện quy trình làm việc của Ban Giám Hiệu, Giáo viên chủ nhiệm (GVCN) và Giáo viên bộ môn (GVBM), bao gồm:
- **32 Lớp học liên cấp** từ Khối 1 đến Khối 9 (Tiểu học: 1/1 - 5/4; THCS: 6/1 - 9/3).
- **Hồ sơ 35 cán bộ, giáo viên** thuộc 5 Tổ chuyên môn.
- **Phân quyền người dùng (RBAC)** rõ ràng: Quản trị viên (ADMIN), Ban Giám Hiệu (BGH - Giám sát & Phê duyệt), Giáo viên chủ nhiệm (GVCN) và Giáo viên bộ môn (GVBM).
- **Quản lý học sinh**: Sơ yếu lý lịch, ban cán sự lớp, đại diện cha mẹ học sinh, phân tổ, diện chính sách và học sinh cần quan tâm.
- **Tổ chức lớp học & Sơ đồ chỗ ngồi**: Xếp chỗ ngồi tự động hoặc tùy chỉnh, liên kết danh sách học sinh.
- **Kế hoạch chủ nhiệm**: Kế hoạch năm học, kế hoạch tháng, lịch công việc tuần.
- **Theo dõi học sinh**: Điểm danh chuyên cần, tổng hợp vắng học, kết quả học tập các môn, theo dõi nề nếp, kỷ luật và vi phạm bằng ngôn ngữ sư phạm.
- **Thi đua & Khen thưởng**: Bảng điểm thi đua 4 tổ theo tuần/tháng, hồ sơ học sinh năng khiếu và khen thưởng.
- **Báo cáo & Xuất bản**: Báo cáo sơ kết học kỳ, tổng kết năm học, và in ấn Sổ Chủ Nhiệm khổ A4 chuẩn Bộ GD&ĐT (hỗ trợ xuất Excel, in PDF).

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend / Dev Server**: [Express.js](https://expressjs.com/) tích hợp qua `server.ts` & Vite middleware
- **Data Export**: [SheetJS (xlsx)](https://docs.sheetjs.com/) cho xuất file Excel chuẩn
- **AI Integration**: Google GenAI SDK (`@google/genai`)

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu môi trường
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Cài đặt các thư viện phụ thuộc
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:
```bash
cp .env.example .env
```
*(Nếu sử dụng tính năng trợ lý AI, cấu hình thêm khóa `GEMINI_API_KEY`)*

### 4. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

---

## 🔑 Tài khoản Đăng nhập Hệ thống (Mật khẩu mặc định: `123`)

Hệ thống đã nạp sẵn đầy đủ tài khoản cho toàn bộ **32 Lớp** và **35 Cán bộ, Giáo viên** theo chuẩn trường TH&THCS Nguyễn Đình Anh:

| Vai trò | Tên tài khoản / Email đăng nhập | Mật khẩu | Phạm vi / Lớp phụ trách |
| :--- | :--- | :--- | :--- |
| **👑 Quản trị viên (ADMIN)** | `admin` hoặc `ducminh1973@gmail.com` | `123` | Quản trị toàn hệ thống & kiêm GVCN 7/1 |
| **🎓 Ban Giám Hiệu (BGH)** | `bgh` hoặc `bgh@nguyendinhanh.edu.vn` | `123` | Giám sát, Ký duyệt Sổ Chủ Nhiệm 32 lớp |
| **👨‍🏫 GVCN 7/1 (Thầy Lê Đức Minh)** | `gvcn` hoặc `ducminh1973@gmail.com` | `123` | Sổ Chủ Nhiệm Lớp 7/1 (Khối THCS) |
| **👩‍🏫 GVCN 1/1 (Thầy Nguyễn Văn Sùng)** | `1/1` hoặc `nvsung_loi2.thqdien@hue.edu.vn` | `123` | Sổ Chủ Nhiệm Lớp 1/1 (Khối Tiểu học) |
| **👩‍🏫 GVCN 1/2 (Cô Nguyễn Thị Lan Anh)** | `1/2` hoặc `ntlanh_loi2.thqdien@hue.edu.vn` | `123` | Sổ Chủ Nhiệm Lớp 1/2 (Khối Tiểu học) |
| **👨‍🏫 GVCN 6/1 (Thầy Trần Trọng)** | `6/1` hoặc `ttrong_loi2.thqdien@hue.edu.vn` | `123` | Sổ Chủ Nhiệm Lớp 6/1 (Khối THCS) |
| **👩‍🏫 GVCN 9/3 (Cô Nguyễn Thị Kim Ngân)** | `9/3` hoặc `nthkngan_loi2.thqdien@hue.edu.vn` | `123` | Sổ Chủ Nhiệm Lớp 9/3 (Khối THCS) |

### 💡 Các tính năng đăng nhập thông minh:
1. **Đăng nhập bằng Tên Lớp**: Bạn chỉ cần gõ tên lớp (ví dụ: `1/1`, `1/2`, `4/3`, `6/1`, `7/1`, `9/3`...) vào ô Tài khoản, mật khẩu `123` là hệ thống sẽ tự động đăng nhập đúng vào tài khoản GVCN của lớp đó.
2. **Từ khóa viết tắt**: Hỗ trợ `admin`, `bgh`, `gvcn`.
3. **Mật khẩu linh hoạt**: Hỗ trợ mật khẩu mặc định `123`, `123456`, `admin` hoặc mật khẩu bảo mật riêng của tài khoản.
4. **Nút bấm 1-chạm**: Ngay trên màn hình đăng nhập có sẵn 4 thẻ đăng nhập 1-chạm và danh mục 32 lớp để bạn bấm vào là đăng nhập ngay mà không cần nhớ email.

---

### 5. Đóng gói cho Production (Build)
```bash
npm run build
```

### 6. Chạy ứng dụng Production (Start)
```bash
npm start
```

---

## 📂 Cấu trúc thư mục dự án

```text
├── src/
│   ├── components/            # Các thành phần giao diện theo module
│   │   ├── academic/          # Quản lý kết quả học tập các môn
│   │   ├── activities/        # Hoạt động phong trào, ngoại khóa
│   │   ├── ai-assistant/      # Trợ lý AI GVCN & BGH
│   │   ├── attendance/        # Điểm danh chuyên cần
│   │   ├── auth/              # Giao diện Đăng nhập hệ thống
│   │   ├── class-info/        # Quản lý danh mục Lớp & Phân công
│   │   ├── competition/       # Thi đua 4 tổ, xếp hạng nề nếp
│   │   ├── conduct/           # Đánh giá hạnh kiểm, rèn luyện
│   │   ├── dashboard/         # Bảng điều khiển (Admin, BGH, GVCN)
│   │   ├── departments/       # Quản lý Tổ chuyên môn
│   │   ├── guide/             # Hướng dẫn sử dụng hệ thống
│   │   ├── layout/            # Header, Sidebar, RoleBanner
│   │   ├── organization/      # Sơ đồ chỗ ngồi, niên khóa & lớp học
│   │   ├── plans/             # Kế hoạch năm học, tháng, lịch làm việc
│   │   ├── print/             # Xuất bản & In Sổ Chủ Nhiệm chuẩn Bộ GD&ĐT
│   │   ├── reports/           # Báo cáo sơ kết, duyệt sổ Ban Giám Hiệu
│   │   ├── settings/          # Cài đặt hệ thống & Sao lưu CSDL
│   │   ├── students/          # Quản lý hồ sơ học sinh
│   │   └── teachers/          # Quản lý hồ sơ giáo viên & tài khoản
│   ├── context/
│   │   └── AppContext.tsx     # Quản lý trạng thái toàn cục & Lưu trữ CSDL
│   ├── data/
│   │   └── dbSeed.ts          # CSDL chuẩn ban đầu (Lớp, Giáo viên, Tổ CM)
│   ├── types/
│   │   └── index.ts           # Định nghĩa Typescript Interfaces & Entities
│   ├── utils/                 # Tiện ích xuất Excel, định dạng ngày tháng
│   ├── App.tsx                # Định tuyến và bố cục chính
│   └── main.tsx               # Điểm khởi chạy React
├── server.ts                  # Server Express tích hợp Vite
├── package.json               # Cấu hình dự án & kịch bản build
└── README.md                  # Tài liệu hướng dẫn dự án
```

---

## 📤 Hướng dẫn đưa lên GitHub (Git Commands)

Thực hiện các lệnh sau trên máy tính của bạn khi đưa mã nguồn lên kho lưu trữ GitHub cá nhân:

```bash
# 1. Khởi tạo kho Git (nếu chưa có)
git init

# 2. Thêm tất cả các tệp vào staging
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: Sổ Chủ Nhiệm Điện Tử - Phiên bản Vận hành Chính thức 1.0.0"

# 4. Đổi nhánh chính sang 'main'
git branch -M main

# 5. Liên kết tới kho lưu trữ GitHub của bạn
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repository>.git

# 6. Đẩy mã nguồn lên GitHub
git push -u origin main
```

---

## 🔒 Quy định bảo mật & Dữ liệu
- Mật khẩu người dùng không bao giờ lưu trữ dưới dạng thô trên client.
- Hệ thống hỗ trợ tính năng **Sao lưu CSDL** (xuất file JSON/Excel) và **Khôi phục dữ liệu** an toàn trong mục Cài đặt hệ thống.
- Chế độ bảo mật vai trò: Quyền Hiệu trưởng (BGH) tập trung vào giám sát và ký duyệt sổ; chức năng quản lý tài khoản được phân quyền riêng cho Quản trị viên (ADMIN).

---

## 🏫 Đơn vị áp dụng
- **Trường:** TH&THCS Nguyễn Đình Anh
- **Năm học:** 2026–2027
- **Bản quyền:** Hệ thống Sổ Chủ Nhiệm Điện Tử
