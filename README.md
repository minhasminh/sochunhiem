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

## 🔑 Tài khoản Đăng nhập Hệ thống (Vận hành Chính thức)

Hệ thống đã thiết lập đầy đủ danh mục tài khoản chính thức cho Ban Giám Hiệu, Quản trị viên và toàn bộ Giáo viên (32 Lớp học):

| Vai trò | Tên tài khoản / Email đăng nhập | Mật khẩu chính thức | Phạm vi / Nhiệm vụ |
| :--- | :--- | :--- | :--- |
| **👑 Quản trị viên (ADMIN)** | `admin` hoặc `ducminh1973@gmail.com` | `T@mduc88$#` | Quản trị toàn hệ thống & phân công chuyên môn |
| **🎓 Ban Giám Hiệu (BGH)** | `bgh` hoặc `bgh@nguyendinhanh.edu.vn` | `Giaovien@2026` | Giám sát, Ký duyệt Sổ Chủ Nhiệm 32 lớp |
| **👨‍🏫 GVCN 7/1 (Thầy Lê Đức Minh)** | `gvcn` hoặc `ducminh1973@gmail.com` | `T@mduc88$#` | Sổ Chủ Nhiệm Lớp 7/1 (Khối THCS) |
| **👩‍🏫 GVCN 1/1 (Thầy Nguyễn Văn Sùng)** | `1/1` hoặc `nvsung_loi2.thqdien@hue.edu.vn` | `Giaovien@2026` | Sổ Chủ Nhiệm Lớp 1/1 (Khối Tiểu học) |
| **👩‍🏫 GVCN 1/2 (Cô Nguyễn Thị Lan Anh)** | `1/2` hoặc `ntlanh_loi2.thqdien@hue.edu.vn` | `Giaovien@2026` | Sổ Chủ Nhiệm Lớp 1/2 (Khối Tiểu học) |
| **👨‍🏫 GVCN 6/1 (Thầy Trần Trọng)** | `6/1` hoặc `ttrong_loi2.thqdien@hue.edu.vn` | `Giaovien@2026` | Sổ Chủ Nhiệm Lớp 6/1 (Khối THCS) |
| **👩‍🏫 GVCN 9/3 (Cô Nguyễn Thị Kim Ngân)** | `9/3` hoặc `nthkngan_loi2.thqdien@hue.edu.vn` | `Giaovien@2026` | Sổ Chủ Nhiệm Lớp 9/3 (Khối THCS) |
| **👩‍🏫 Tất cả GVCN các lớp còn lại** | Email cá nhân hoặc Tên lớp (vd: `2/1`, `3/2`, `8/1`...) | `Giaovien@2026` | Sổ Chủ Nhiệm lớp phụ trách |

### 💡 Quy tắc đăng nhập chính thức:
1. **Tài khoản Quản trị (ADMIN)**: Sử dụng mật khẩu bảo mật cao: `T@mduc88$#`.
2. **Tài khoản Giáo viên & BGH**: Sử dụng mật khẩu khởi tạo chuẩn: `Giaovien@2026`.
3. **Đăng nhập bằng Tên Lớp**: GVCN có thể nhập trực tiếp tên lớp (ví dụ: `1/1`, `1/2`, `4/3`, `6/1`, `7/1`, `9/3`...) kèm mật khẩu `Giaovien@2026` để vào nhanh sổ lớp.
4. **Từ khóa viết tắt**: Hỗ trợ `admin`, `bgh`, `gvcn`.

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

## 📤 Hướng dẫn Đưa dự án lên GitHub (Push to GitHub)

Dự án đã được khởi tạo sẵn git và commit toàn bộ mã nguồn cùng cấu hình. Để đưa lên kho lưu trữ GitHub của bạn:

```bash
# 1. Thêm địa chỉ kho chứa GitHub của bạn:
git remote add origin https://github.com/<ten-tai-khoan-github>/<ten-repository>.git

# 2. Đổi tên nhánh chính thành main (nếu chưa):
git branch -M main

# 3. Đẩy toàn bộ mã nguồn lên GitHub:
git push -u origin main
```

*(Lưu ý: Nếu kho GitHub mới tạo đã có sẵn file README hoặc LICENSE, dùng `git pull origin main --rebase` trước khi push).*

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
