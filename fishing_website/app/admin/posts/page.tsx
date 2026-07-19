'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/api';
import { 
  Plus, 
  Trash2, 
  Eye, 
  FileText, 
  ArrowLeft, 
  Compass, 
  Globe, 
  Lock, 
  User, 
  Calendar,
  X 
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

interface Post {
  id: number;
  title: string;
  slug: string;
  htmlContent: string;
  author: string;
  isVisible: boolean;
  createdAt: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // New post inputs
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('Admin');
  const [newIsVisible, setNewIsVisible] = useState(true);
  const [savingPost, setSavingPost] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllPosts();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }
    try {
      setSavingPost(true);
      await adminApi.createPost({
        title: newTitle.trim(),
        htmlContent: newContent.trim() || '<p>Nội dung bài viết mới...</p>',
        author: newAuthor.trim() || 'Admin',
        isVisible: newIsVisible,
      });
      alert('Tạo bài viết mới thành công!');
      setIsAddModalOpen(false);
      // Reset inputs
      setNewTitle('');
      setNewContent('');
      setNewAuthor('Admin');
      setNewIsVisible(true);
      loadPosts();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu bài viết.');
    } finally {
      setSavingPost(false);
    }
  };

  const handleDeletePost = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa bài viết',
      message: 'Bạn có chắc chắn muốn xoá bài viết này không? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await adminApi.deletePost(id);
          alert('Xoá bài viết thành công!');
          loadPosts();
        } catch (err: any) {
          alert(err.message || 'Lỗi khi xoá bài viết.');
        }
      }
    });
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
            Quản lý bài viết Blog
          </h1>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-xs bg-primary hover:bg-[#1e40af] text-white text-label-sm font-bold px-lg py-2.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>TẠO BÀI VIẾT MỚI</span>
        </button>
      </div>

      {/* Grid of posts */}
      {loading ? (
        <div className="flex justify-center items-center py-xl">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-xl text-center shadow-ambient">
          <FileText className="w-12 h-12 text-outline-variant/60 mx-auto mb-xs" />
          <h3 className="text-body-lg font-bold text-on-surface">Không có bài viết nào</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto mt-1 leading-relaxed">
            Bạn chưa tạo bài viết nào cho Blog của WildStream. Hãy bấm nút phía trên để bắt đầu soạn bài viết mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white rounded-2xl border border-outline-variant/30 p-md flex flex-col justify-between shadow-sm hover:shadow transition-shadow duration-200 text-left"
            >
              <div className="space-y-xs">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                    post.isVisible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {post.isVisible ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>{post.isVisible ? 'Công khai' : 'Nháp'}</span>
                  </span>
                  
                  <div className="flex items-center gap-xs">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-100 transition-colors"
                      title="Xem nội dung"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa bài viết"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-label-md font-bold text-on-surface line-clamp-2 mt-xs leading-snug">
                  {post.title}
                </h3>

                <p className="text-[12px] text-on-surface-variant line-clamp-3 leading-relaxed">
                  {post.htmlContent ? post.htmlContent.replace(/<[^>]*>/g, '') : 'Không có nội dung...'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-on-surface-variant border-t border-outline-variant/10 pt-xs mt-md">
                <span className="flex items-center gap-0.5 font-medium">
                  <User className="w-3.5 h-3.5 text-outline" /> {post.author || 'Admin'}
                </span>
                <span className="flex items-center gap-0.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-outline" /> 
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-sm backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-md md:p-lg text-left shadow-2xl relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-sm">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                Xem trước bài viết
              </span>
              <h2 className="text-headline-md font-bold text-on-surface leading-snug">
                {selectedPost.title}
              </h2>
              
              <div className="flex items-center gap-md text-[12px] text-on-surface-variant pb-xs border-b border-outline-variant/10">
                <span>Tác giả: <strong>{selectedPost.author || 'Admin'}</strong></span>
                <span>•</span>
                <span>Ngày tạo: <strong>{new Date(selectedPost.createdAt).toLocaleDateString('vi-VN')}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  {selectedPost.isVisible ? 'Hiển thị: Công khai' : 'Hiển thị: Bản nháp'}
                </span>
              </div>

              {/* HTML Content Body */}
              <div 
                className="text-body-md text-on-surface-variant leading-relaxed font-sans pt-xs space-y-sm prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPost.htmlContent }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ADD POST MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-sm backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-md md:p-lg text-left shadow-2xl">
            <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mb-md pb-xs border-b border-outline-variant/10 flex items-center gap-xs">
              <FileText className="w-5 h-5 text-primary" />
              <span>Tạo bài viết Blog mới</span>
            </h3>

            <form onSubmit={handleSavePost} className="space-y-sm">
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tiêu đề hấp dẫn..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm font-bold text-on-surface-variant">Tác giả</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm font-bold text-on-surface-variant font-sans">Trạng thái</label>
                  <select
                    value={newIsVisible ? 'true' : 'false'}
                    onChange={(e) => setNewIsVisible(e.target.value === 'true')}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary font-sans"
                  >
                    <option value="true">Công khai</option>
                    <option value="false">Lưu nháp</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="text-label-sm font-bold text-on-surface-variant">Nội dung bài viết (HTML)</label>
                <textarea
                  placeholder="<p>Nhập nội dung bài viết...</p>"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg py-2 px-3 text-body-sm text-on-surface focus:outline-none focus:border-primary resize-none font-mono"
                />
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
                  disabled={savingPost}
                  className="px-lg py-2 bg-primary hover:bg-[#1e40af] disabled:bg-primary/50 text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {savingPost ? 'ĐANG LƯU...' : 'LƯU BÀI VIẾT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
