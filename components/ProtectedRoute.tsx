"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("adminUser");
    
    if (!token || !userStr) {
      router.push("/");
      return;
    } 

    try {
      const user = JSON.parse(userStr);
      if (user.role === 'staff') {
        let allowedPrefixes = ['/dashboard/tasks'];
        switch (user.position) {
          case 'consultant':
            allowedPrefixes = ['/dashboard/tasks', '/dashboard/consulting'];
            break;
          case 'cashier':
            allowedPrefixes = ['/dashboard/tasks', '/dashboard/orders', '/dashboard/consulting'];
            break;
          case 'warehouse':
            allowedPrefixes = ['/dashboard/tasks', '/dashboard/inventory', '/dashboard/suppliers'];
            break;
          case 'shipping':
            allowedPrefixes = ['/dashboard/tasks', '/dashboard/orders'];
            break;
          case 'technician':
            allowedPrefixes = ['/dashboard/tasks', '/dashboard/warranties', '/dashboard/consulting'];
            break;
          case 'content':
            allowedPrefixes = ['/dashboard/tasks', '/dashboard/blog', '/dashboard/banners'];
            break;
          case 'customer_service':
            allowedPrefixes = ['/dashboard/tasks', '/dashboard/reviews', '/dashboard/consulting'];
            break;
          case 'manager':
            allowedPrefixes = ['/dashboard/tasks', '/dashboard/orders', '/dashboard/products', '/dashboard/inventory', '/dashboard/consulting', '/dashboard/reports', '/dashboard/warranties'];
            break;
          default:
            allowedPrefixes = ['/dashboard/tasks', '/dashboard/orders', '/dashboard/inventory', '/dashboard/consulting', '/dashboard/blog', '/dashboard/warranties'];
        }
        
        // Exact match for /dashboard is allowed for manager
        if (pathname === '/dashboard' && user.position !== 'manager') {
          router.push(allowedPrefixes[0]);
          return;
        }

        if (pathname !== '/dashboard') {
          const isAllowed = allowedPrefixes.some(p => pathname.startsWith(p));
          
          if (!isAllowed) {
            router.push(allowedPrefixes[0]);
            return;
          }
        }
      }
      
      setIsAuthenticated(true);
      setIsAuthorized(true);
    } catch (e) {
      router.push("/");
    }
  }, [router, pathname]);

  if (!isAuthenticated || !isAuthorized) {
    return null; // Hoặc một loading spinner
  }

  return <>{children}</>;
}
