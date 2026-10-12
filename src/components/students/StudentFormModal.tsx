import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, User, Users, BookOpen, Clock } from 'lucide-react';
import { Student } from '../../types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>) => { success: boolean; message?: string };
  initialData?: Student | null;
  currentClassId?: string;
  currentSchoolYearId?: string;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentClassId = 'class-7-1',
  currentSchoolYearId = 'sy-2026-2027',
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'academic' | 'tracking'>('personal');

  const [formData, setFormData] = useState<Omit<Student, 'id' | 'stt' | 'createdAt' | 'updatedAt'>>({
    classId: currentClassId,
    schoolYearId: currentSchoolYearId,
    studentCode: '',
    fullName: '',
    birthDate: '',
    gender: 'Nam',
    ethnicity: 'Kinh',
    address: 'Thôn Thạnh Lợi, Xã Đan Điền, Thành phố Huế',
    residence: 'Thôn Thạnh Lợi, Xã Đan Điền',
    phone: '',
    notes: '',
    fatherName: '',
    fatherJob: '',
    fatherPhone: '',
    motherName: '',
    motherJob: '',
    motherPhone: '',
    guardianName: '',
    emergencyContact: '',
    familyNotes: '',
    outstandingAbility: '',
    favoriteSubject: '',
    supportNeededSubject: '',
    talents: '',
    achievements: '',
    groupNumber: 1,
    needsSupport: false,
    supportReason: '',
    hasProgress: false,
    hasSpecialTalent: false,
    needsAttention: false,
    status: 'active',
    isPoorHousehold: false,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        classId: initialData.classId,
        schoolYearId: initialData.schoolYearId,
        studentCode: initialData.studentCode,
        fullName: initialData.fullName,
        birthDate: initialData.birthDate,
        gender: initialData.gender,
        ethnicity: initialData.ethnicity,
        address: initialData.address,
        residence: initialData.residence,
        phone: initialData.phone,
        notes: initialData.notes || '',
        fatherName: initialData.fatherName || '',
        fatherJob: initialData.fatherJob || '',
        fatherPhone: initialData.fatherPhone || '',
        motherName: initialData.motherName || '',
        motherJob: initialData.motherJob || '',
        motherPhone: initialData.motherPhone || '',
        guardianName: initialData.guardianName || '',
        emergencyContact: initialData.emergencyContact || '',
        familyNotes: initialData.familyNotes || '',
        outstandingAbility: initialData.outstandingAbility || '',
        favoriteSubject: initialData.favoriteSubject || '',
        supportNeededSubject: initialData.supportNeededSubject || '',
        talents: initialData.talents || '',
        achievements: initialData.achievements || '',
        groupNumber: initialData.groupNumber || 1,
        needsSupport: initialData.needsSupport,
        supportReason: initialData.supportReason || '',
        hasProgress: initialData.hasProgress,
        hasSpecialTalent: initialData.hasSpecialTalent,
        needsAttention: initialData.needsAttention,
        status: initialData.status,
        isPoorHousehold: initialData.isPoorHousehold,
      });
    } else {
      setFormData({
        classId: currentClassId,
        schoolYearId: currentSchoolYearId,
        studentCode: '',
        fullName: '',
        birthDate: '',
        gender: 'Nam',
        ethnicity: 'Kinh',
        address: 'Thôn Thạnh Lợi, Xã Đan Điền, Thành phố Huế',
        residence: 'Thôn Thạnh Lợi, Xã Đan Điền',
        phone: '',
        notes: '',
        fatherName: '',
        fatherJob: '',
        fatherPhone: '',
        motherName: '',
        motherJob: '',
        motherPhone: '',
        guardianName: '',
        emergencyContact: '',
        familyNotes: '',
        outstandingAbility: '',
        favoriteSubject: '',
        supportNeededSubject: '',
        talents: '',
        achievements: '',
        groupNumber: 1,
        needsSupport: false,
        supportReason: '',
        hasProgress: false,
        hasSpecialTalent: false,
        needsAttention: false,
        status: 'active',
        isPoorHousehold: false,
      });
    }
    setErrorMessage(null);
    setActiveTab('personal');
  }, [initialData, isOpen, currentClassId, currentSchoolYearId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim()) {
      setErrorMessage('Họ và tên học sinh không được để trống.');
      setActiveTab('personal');
      return;
    }
    if (!formData.studentCode.trim()) {
      setErrorMessage('Mã học sinh không được để trống.');
      setActiveTab('personal');
      return;
    }
    if (!formData.birthDate.trim()) {
      setErrorMessage('Ngày sinh không được để trống (Định dạng: DD/MM/YYYY).');
      setActiveTab('personal');
      return;
    }

    const res = onSave(formData);
    if (!res.success) {
      setErrorMessage(res.message || 'Lỗi khi lưu hồ sơ học sinh.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? `Chỉnh sửa hồ sơ: ${initialData.fullName}` : 'Thêm mới học sinh vào lớp'}
            </h3>
            <p className="text-xs text-slate-500">
              Mỗi học sinh chỉ có một hồ sơ duy nhất làm nguồn chuẩn cho toàn bộ sổ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="px-6 bg-white border-b border-slate-100 flex items-center gap-2 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'personal'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> 1. Thông tin cá nhân
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('family')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'family'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 2. Thông tin gia đình
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'academic'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 3. Thông tin học tập
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tracking')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tracking'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> 4. Thông tin theo dõi
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'personal' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 2000837447"
                    value={formData.studentCode}
                    onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Phan Nguyệt Ánh"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ngày sinh (DD/MM/YYYY) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="04/06/2014"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Nam' | 'Nữ' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dân tộc</label>
                  <input
                    type="text"
                    value={formData.ethnicity}
                    onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Địa chỉ thường trú</label>
                  <input
                    type="text"
                    placeholder="Thôn Thạnh Lợi, Xã Đan Điền, Thành phố Huế"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại HS nếu có</label>
                  <input
                    type="text"
                    placeholder="0972635159"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Nơi ở hiện nay</label>
                  <input
                    type="text"
                    placeholder="Thôn Thạnh Lợi, Xã Đan Điền"
                    value={formData.residence}
                    onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Ghi chú cá nhân</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú về học sinh..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THÔNG TIN GIA ĐÌNH */}
          {activeTab === 'family' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3 font-bold text-sky-800 pb-1 border-b border-slate-100">
                  Thông tin Cha
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ tên Cha</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fatherName || ''}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nghề nghiệp Cha</label>
                  <input
                    type="text"
                    placeholder="Làm nông, công nhân..."
                    value={formData.fatherJob || ''}
                    onChange={(e) => setFormData({ ...formData, fatherJob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Điện thoại Cha</label>
                  <input
                    type="text"
                    placeholder="0912.xxx.xxx"
                    value={formData.fatherPhone || ''}
                    onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3 font-bold text-sky-800 pb-1 border-b border-slate-100 pt-2">
                  Thông tin Mẹ
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ tên Mẹ</label>
                  <input
                    type="text"
                    placeholder="Trần Thị B"
                    value={formData.motherName || ''}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nghề nghiệp Mẹ</label>
                  <input
                    type="text"
                    placeholder="Nội trợ, làm nông..."
                    value={formData.motherJob || ''}
                    onChange={(e) => setFormData({ ...formData, motherJob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Điện thoại Mẹ</label>
                  <input
                    type="text"
                    placeholder="0988.xxx.xxx"
                    value={formData.motherPhone || ''}
                    onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3 font-bold text-sky-800 pb-1 border-b border-slate-100 pt-2">
                  Người giám hộ & Liên hệ khẩn cấp
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Người giám hộ nếu có</label>
                  <input
                    type="text"
                    placeholder="Ông/bà, người đỡ đầu..."
                    value={formData.guardianName || ''}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Thông tin liên hệ khẩn cấp</label>
                  <input
                    type="text"
                    placeholder="Số điện thoại hoặc địa chỉ liên lạc người thân..."
                    value={formData.emergencyContact || ''}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THÔNG TIN HỌC TẬP */}
          {activeTab === 'academic' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Năng lực nổi bật</label>
                  <input
                    type="text"
                    placeholder="Tự giác, tiếp thu bài nhanh, tư duy logic..."
                    value={formData.outstandingAbility || ''}
                    onChange={(e) => setFormData({ ...formData, outstandingAbility: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Môn học yêu thích</label>
                  <input
                    type="text"
                    placeholder="Toán, Ngữ văn, KHTN, Mỹ thuật..."
                    value={formData.favoriteSubject || ''}
                    onChange={(e) => setFormData({ ...formData, favoriteSubject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-rose-800">
                    Môn cần hỗ trợ / phụ đạo
                  </label>
                  <input
                    type="text"
                    placeholder="Toán học, Tiếng Anh..."
                    value={formData.supportNeededSubject || ''}
                    onChange={(e) => setFormData({ ...formData, supportNeededSubject: e.target.value })}
                    className="w-full px-3 py-2 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-rose-50/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Năng khiếu</label>
                  <input
                    type="text"
                    placeholder="Hát múa, bóng đá, vẽ, cờ vua..."
                    value={formData.talents || ''}
                    onChange={(e) => setFormData({ ...formData, talents: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Thành tích / Khen thưởng</label>
                  <textarea
                    rows={2}
                    placeholder="Học sinh Giỏi năm trước, giải thi văn nghệ, thể thao..."
                    value={formData.achievements || ''}
                    onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THÔNG TIN THEO DÕI */}
          {activeTab === 'tracking' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân tổ học tập</label>
                  <select
                    value={formData.groupNumber}
                    onChange={(e) => setFormData({ ...formData, groupNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trạng thái hồ sơ</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'locked' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-bold"
                  >
                    <option value="active">Đang học (Hoạt động)</option>
                    <option value="locked">Đã khóa hồ sơ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needsSupport}
                    onChange={(e) => setFormData({ ...formData, needsSupport: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded-md"
                  />
                  <span className="font-semibold text-slate-700">Cần hỗ trợ</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasProgress}
                    onChange={(e) => setFormData({ ...formData, hasProgress: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded-md"
                  />
                  <span className="font-semibold text-slate-700">Có tiến bộ</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasSpecialTalent}
                    onChange={(e) => setFormData({ ...formData, hasSpecialTalent: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded-md"
                  />
                  <span className="font-semibold text-slate-700">Năng khiếu</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needsAttention}
                    onChange={(e) => setFormData({ ...formData, needsAttention: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded-md"
                  />
                  <span className="font-semibold text-slate-700">Cần quan tâm</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 cursor-pointer col-span-2">
                  <input
                    type="checkbox"
                    checked={formData.isPoorHousehold}
                    onChange={(e) => setFormData({ ...formData, isPoorHousehold: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded-md"
                  />
                  <span className="font-semibold text-amber-900">Thuộc diện Hộ nghèo/cận nghèo (/GCN-HN.HCN)</span>
                </label>
              </div>

              {formData.needsSupport && (
                <div>
                  <label className="block font-semibold text-rose-800 mb-1">
                    Lý do & Nội dung cần hỗ trợ
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Cần phụ đạo môn Toán, đôi bạn cùng tiến giúp đỡ..."
                    value={formData.supportReason || ''}
                    onChange={(e) => setFormData({ ...formData, supportReason: e.target.value })}
                    className="w-full px-3 py-2 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-rose-50/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Lưu hồ sơ học sinh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
