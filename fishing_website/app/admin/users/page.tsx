'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/api';
import { 
  Plus, 
  Users, 
  Shield, 
  Mail, 
  Key, 
  UserCheck, 
  Edit3, 
  Settings 
} from 'lucide-react';

interface AdminUser {
  id: number;
  fullname: string;
  email: string;
  roles: string[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add User modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleOption, setNewRoleOption] = useState('admin'); // 'admin', 'kho', 'shipper'
  const [savingUser, setSavingUser] = useState(false);

  // Edit Roles modal
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedEditRole, setSelectedEditRole] = useState('admin'); // 'admin', 'kho', 'shipper'
  const [updatingRoles, setUpdatingRoles] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllAdmins();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Error loading admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      alert('Vui lòng điền đầy đủ thông tin yêu cầu!');
      return;
    }
    try {
      setSavingUser(true);
      const roleName = newRoleOption === 'kho'
        ? 'MANAGER'
        : newRoleOption === 'shipper'
          ? 'SHIPPER'
          : 'ADMIN';

      await adminApi.createAdminUser({
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword,
        roleName,
      });
      alert('Tạo tài khoản quản trị mới thành công!');
      setIsAddModalOpen(false);
      // Reset input values
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRoleOption('admin');
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo tài khoản.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleUpdateRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setUpdatingRoles(true);
      const roleName = selectedEditRole === 'kho'
        ? 'MANAGER'
        : selectedEditRole === 'shipper'
          ? 'SHIPPER'
          : 'ADMIN';

      await adminApi.updateRoles(editingUser.id, roleName);
      alert('Cập nhật phân quyền tài khoản thành công!');
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật vai trò.');
    } finally {
      setUpdatingRoles(false);
    }
  };

  const openEditRoles = (user: AdminUser) => {
    setEditingUser(user);
    // Convert role strings to ID option: 'admin', 'kho', 'shipper'
    let option = 'admin';
    if (Array.isArray(user.roles)) {
      const rolesLower = user.roles.map(r => r.toLowerCase());
      if (rolesLower.includes('admin')) option = 'admin';
      else if (rolesLower.includes('manager') || rolesLower.includes('approver')) option = 'kho';
      else if (rolesLower.includes('shipper')) option = 'shipper';
    }
    setSelectedEditRole(option);
  };

  return (
    <div className="space-y-md">
      
      {/* Header action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-xs">
        <div>
          <span className="text-label-sm text-secondary uppercase font-semibold tracking-wider block mb-1">
            WildStream CMS
          </span>
          <h1 className="text-headline-md font-bold text-on-surface tracking-tight">
            Quản lý Tài khoản Quản trị
          </h1>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-xs bg-primary hover:bg-[#1e40af] text-white text-label-sm font-bold px-lg py-2.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>TẠO TÀI KHOẢN MỚI</span>
        </button>
      </div>

      {/* List of admin users */}
      {loading ? (
        <div className="flex justify-center items-center py-xl">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-xl text-center shadow-ambient">
          <Users className="w-12 h-12 text-outline-variant/60 mx-auto mb-xs" />
          <h3 className="text-body-lg font-bold text-on-surface">Không tìm thấy tài khoản quản trị nào</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden text-left">
          <table className="w-full text-label-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant/20 text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3.5 px-md">ID</th>
                <th className="py-3.5 px-md">Họ tên / Username</th>
                <th className="py-3.5 px-md">Địa chỉ Email</th>
                <th className="py-3.5 px-md">Vai trò / Phân quyền</th>
                <th className="py-3.5 px-md text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-body-sm text-on-surface-variant">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-md font-mono font-bold text-slate-500">#{user.id}</td>
                  <td className="py-3.5 px-md">
                    <div className="font-bold text-on-surface flex items-center gap-xs">
                      <UserCheck className="w-4 h-4 text-primary/70" />
                      <span>{user.fullname || 'Chưa đặt tên'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-md font-mono text-[12px]">{user.email}</td>
                  <td className="py-3.5 px-md">
                    <div className="flex flex-wrap gap-xs">
                      {user.roles && user.roles.map((r, idx) => (
                        <span 
                          key={idx} 
                          className="bg-primary/10 text-primary text-[10px] font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-0.5"
                        >
                          <Shield className="w-3 h-3 text-primary" />
                          <span>{r}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-md text-right">
                    <button
                      onClick={() => openEditRoles(user)}
                      className="inline-flex items-center gap-xs text-[11px] font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa Quyền</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT ROLES MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-sm backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-md md:p-lg text-left shadow-2xl">
            <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mb-md pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <Settings className="w-5 h-5 text-primary" />
              <span>Chỉnh sửa Phân quyền</span>
            </h3>

            <div className="mb-sm text-label-sm space-y-1">
              <div>Tài khoản: <strong>{editingUser.fullname || 'Chưa đặt tên'}</strong></div>
              <div className="text-on-surface-variant font-mono">{editingUser.email}</div>
            </div>

            <form onSubmit={handleUpdateRoles} className="space-y-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant mb-xs">Chọn vai trò hệ thống:</label>
                <select
                  value={selectedEditRole}
                  onChange={(e) => setSelectedEditRole(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer font-sans"
                >
                  <option value="admin">QUẢN TRỊ VIÊN (ADMIN)</option>
                  <option value="kho">QUẢN LÝ KHO (MANAGER)</option>
                  <option value="shipper">NHÂN VIÊN GIAO HÀNG (SHIPPER)</option>
                </select>
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-lg py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-on-surface font-bold cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updatingRoles}
                  className="px-lg py-2 bg-primary hover:bg-[#1e40af] disabled:bg-primary/50 text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {updatingRoles ? '...' : 'CẬP NHẬT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-sm backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-md md:p-lg text-left shadow-2xl">
            <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mb-md pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <Plus className="w-5 h-5 text-primary" />
              <span>Tạo tài khoản quản trị mới</span>
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-sm">
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">Tên tài khoản / Username *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên đăng ký..."
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-[#00288e] flex items-center gap-xs">
                  <Mail className="w-4 h-4 text-outline" />
                  <span>Địa chỉ Email *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-[#00288e] flex items-center gap-xs">
                  <Key className="w-4 h-4 text-outline" />
                  <span>Mật khẩu truy cập *</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Tối thiểu 6 ký tự..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant mb-xs">Chọn quyền mặc định:</label>
                <select
                  value={newRoleOption}
                  onChange={(e) => setNewRoleOption(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer font-sans"
                >
                  <option value="admin">ADMIN</option>
                  <option value="kho">QUẢN LÝ KHO</option>
                  <option value="shipper">SHIPPER</option>
                </select>
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant/10 mt-md">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-lg py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-on-surface font-bold cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-lg py-2 bg-primary hover:bg-[#1e40af] disabled:bg-primary/50 text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {savingUser ? 'ĐANG TẠO...' : 'TẠO TÀI KHOẢN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
