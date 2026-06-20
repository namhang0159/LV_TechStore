import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { Address } from '@/hooks/useAddress';
import { addUserAddress, updateUserAddress } from '@/util/api';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: Address | null;
  onSuccess: () => void;
}

export default function AddressModal({ isOpen, onClose, addressToEdit, onSuccess }: AddressModalProps) {
  const [formData, setFormData] = useState({
    receiver_name: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    address_line: '',
    is_default: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (addressToEdit && isOpen) {
      setFormData({
        receiver_name: addressToEdit.receiver_name || '',
        phone: addressToEdit.phone || '',
        province: addressToEdit.province || '',
        district: addressToEdit.district || '',
        ward: addressToEdit.ward || '',
        address_line: addressToEdit.address_line || '',
        is_default: addressToEdit.is_default || false,
      });
    } else if (isOpen) {
      setFormData({
        receiver_name: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        address_line: '',
        is_default: false,
      });
    }
  }, [addressToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (addressToEdit) {
        await updateUserAddress(addressToEdit.id.toString(), formData);
      } else {
        await addUserAddress(
          formData.receiver_name,
          formData.phone,
          formData.province,
          formData.district,
          formData.ward,
          formData.address_line,
          formData.is_default
        );
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      alert("Có lỗi xảy ra khi lưu địa chỉ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6">
          {addressToEdit ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <Input
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
              <Input
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="VD: Hà Nội"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
              <Input
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="VD: Cầu Giấy"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
              <Input
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                placeholder="VD: Dịch Vọng"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể (Số nhà, tên đường)</label>
            <Input
              name="address_line"
              value={formData.address_line}
              onChange={handleChange}
              placeholder="Nhập địa chỉ cụ thể"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700">
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu địa chỉ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
