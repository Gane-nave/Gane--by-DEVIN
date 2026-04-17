import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { cn } from '../lib/utils';

interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  totalCost: number;
  items: string[];
  createdAt: any;
}

export function FulfillmentSync() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(newOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'processing': return <Package className="w-4 h-4 text-blue-400" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-400" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="text-zinc-400">Syncing with fulfillment center...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-zinc-100">Fulfillment Sync</h2>
        <p className="text-xs text-zinc-500 mt-1">Global Logistics & Order Management</p>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-zinc-300">Active Orders</h3>
        <div className="text-sm text-zinc-400">
          Total: {orders.length}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
          No active orders found in the system.
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-zinc-400">#{order.id.slice(0, 8)}</span>
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                    order.status === 'pending' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    order.status === 'processing' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    order.status === 'shipped' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                    order.status === 'delivered' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  )}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>
                <div className="text-sm text-zinc-300">
                  {order.items.join(', ')}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {order.createdAt?.toDate?.().toLocaleString() || 'Just now'}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                <div className="text-lg font-medium">${order.totalCost.toFixed(2)}</div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as any)}
                    className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-full sm:w-auto"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
