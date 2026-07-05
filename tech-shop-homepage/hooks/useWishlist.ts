import { useState, useEffect } from 'react';
import { getWishlist, addToWishlist as apiAdd, removeFromWishlist as apiRemove } from '@/util/api';

export const useWishlist = () => {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            if (typeof window !== "undefined") {
                const token = localStorage.getItem("token");
                if (!token || token === "null" || token === "undefined") {
                    setLoading(false);
                    return;
                }
            }
            if (!localStorage.getItem("token")) {
                setLoading(false);
                return;
            }
            setLoading(true);
            const res = await getWishlist();
            if (res.data) {
                setWishlist(res.data);
            }
        } catch (error) {
            console.error('Error fetching wishlist', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const addToWishlist = async (productId: number) => {
        try {
            await apiAdd(productId);
            await fetchWishlist();
            return true;
        } catch (error) {
            console.error('Error adding to wishlist', error);
            return false;
        }
    };

    const removeFromWishlist = async (productId: number) => {
        try {
            await apiRemove(productId);
            await fetchWishlist();
            return true;
        } catch (error) {
            console.error('Error removing from wishlist', error);
            return false;
        }
    };

    const toggleWishlist = async (productId: number) => {
        if (isInWishlist(productId)) {
            return await removeFromWishlist(productId);
        } else {
            return await addToWishlist(productId);
        }
    };

    const isInWishlist = (productId: number) => {
        return wishlist.some((item: any) => item.product_id === productId);
    };

    return {
        wishlist,
        loading,
        refetch: fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist
    };
};
