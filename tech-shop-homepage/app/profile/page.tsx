"use client";

import { Card } from '@/components/ui/card'
import { Edit, Plus, Trash2, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAddress, Address } from '@/hooks/useAddress'
import { deleteUserAddress, setDefaultAddress } from '@/util/api'
import AddressModal from '@/components/address/AddressModal'

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const { addresses, loading: addressLoading, refetch } = useAddress();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setModalOpen(true);
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setModalOpen(true);
    };

    const handleDeleteAddress = async (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
            try {
                await deleteUserAddress(id.toString());
                await refetch();
            } catch (err) {
                console.error(err);
                alert("Lỗi khi xóa địa chỉ");
            }
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await setDefaultAddress(id.toString());
            await refetch();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi đặt địa chỉ mặc định");
        }
    };

    const defaultAddress = addresses.find(a => a.is_default);
    const otherAddresses = addresses.filter(a => !a.is_default);

    return (
        <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Contact Information */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Contact information</h3>
                    <p className="text-sm text-gray-700 mb-1">{user?.name || "Đang tải..."}</p>
                    <p className="text-sm text-gray-700 mb-4">{user?.email || "Đang tải..."}</p>
                    <div className="flex gap-4">
                        <a href="#" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                            <Edit className="w-4 h-4" /> Edit
                        </a>
                        <a href="#" className="text-blue-600 text-sm hover:underline">Change Password</a>
                    </div>
                </div>

                {/* Newsletters */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Newsletters</h3>
                    <p className="text-sm text-gray-700 mb-4">You don&apos;t subscribe to our newsletter.</p>
                    <a href="#" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                        <Edit className="w-4 h-4" /> Edit
                    </a>
                </div>
            </div>

            {/* Address Book */}
            <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">Sổ địa chỉ</h3>
                    <button
                        onClick={handleAddAddress}
                        className="text-blue-600 text-sm hover:underline flex items-center gap-1 font-medium"
                    >
                        <Plus className="w-4 h-4" /> Thêm địa chỉ mới
                    </button>
                </div>

                {addressLoading ? (
                    <div className="text-sm text-gray-500 py-4">Đang tải sổ địa chỉ...</div>
                ) : addresses.length === 0 ? (
                    <div className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center">
                        Bạn chưa có địa chỉ nào. Hãy thêm một địa chỉ để dễ dàng mua sắm.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Render Default Address First */}
                        {defaultAddress && (
                            <Card className="bg-blue-50/50 border border-blue-200 p-6 relative">
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => handleEditAddress(defaultAddress)} className="text-gray-500 hover:text-blue-600">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-start gap-2 mb-3">
                                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            {defaultAddress.receiver_name}
                                            <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                Mặc định
                                            </span>
                                        </h4>
                                        <p className="text-sm font-medium text-gray-700 mt-1">{defaultAddress.phone}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 pl-7">
                                    <p>{defaultAddress.address_line}</p>
                                    <p>{`${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.province}`}</p>
                                </div>
                            </Card>
                        )}

                        {/* Render Other Addresses */}
                        {otherAddresses.map(address => (
                            <Card key={address.id} className="bg-gray-50 border border-gray-200 p-6 relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditAddress(address)} className="text-gray-500 hover:text-blue-600" title="Sửa">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteAddress(address.id)} className="text-gray-500 hover:text-red-600" title="Xóa">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-start gap-2 mb-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{address.receiver_name}</h4>
                                        <p className="text-sm font-medium text-gray-700 mt-1">{address.phone}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 pl-7 mb-4">
                                    <p>{address.address_line}</p>
                                    <p>{`${address.ward}, ${address.district}, ${address.province}`}</p>
                                </div>
                                <div className="pl-7">
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="text-xs text-blue-600 hover:underline font-medium"
                                    >
                                        Đặt làm mặc định
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <AddressModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                addressToEdit={editingAddress}
                onSuccess={() => refetch()}
            />
        </div>
    )
}
