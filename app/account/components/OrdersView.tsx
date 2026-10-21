"use client";

import React, { useState } from "react";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";
import { Order } from "@/interfaces/Order";
import OrderDetailsModal from "./OrderDetailsModal";
import { toSafeLocaleString } from "@/actions/utilAction";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoChevronForwardOutline } from "react-icons/io5";

interface OrdersViewProps {
  orders: any[];
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders }) => {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="commerce-orders space-y-8">
        {/* Header */}
        <div className="border-b border-glass-border pb-6">
          <span className="v2-section-label mb-1">PURCHASES</span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-primary m-0">
            Order History
          </h2>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <EmptyState
              heading="No orders yet"
              subHeading="Your purchase history will appear here once you've made your first order."
              actionLabel="Start Shopping"
              onAction={() => router.push("/collections/products")}
            />
          ) : (
            orders.map((order: any, idx: number) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleViewOrder(order)}
                role="button" tabIndex={0} onKeyDown={(event) => { if(event.key === "Enter" || event.key === " ") { event.preventDefault(); handleViewOrder(order); } }}
                className="v2-glass p-5 rounded-3xl border border-glass-border hover:border-accent transition-all duration-300 group cursor-pointer flex flex-col md:flex-row items-center gap-6"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-accent-text shrink-0 overflow-hidden border border-glass-border p-1 flex items-center justify-center relative">
                  <Image
                    width={80}
                    height={80}
                    src={
                      order.items?.[0]?.thumbnail ||
                      "/collection-placeholder.png"
                    }
                    alt="Product"
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 w-full flex flex-col justify-center text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <h3 className="text-base font-black uppercase text-primary m-0">
                        {order.status || "PROCESSING"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.riskStatus === 'HIGH_RISK' && !order.deliveryFeePrepaid && (
                        <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30 text-[9px] font-bold uppercase tracking-wider">
                          ⚠️ PREPAID FEE PENDING
                        </span>
                      )}
                      {order.riskStatus === 'HIGH_RISK' && order.deliveryFeePrepaid && (
                        <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 text-[9px] font-bold uppercase tracking-wider">
                          ✓ FEE PAID
                        </span>
                      )}
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                        {order.id?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-secondary m-0 mb-3 line-clamp-1">
                    {order.items?.[0]?.name || "Neverbe Gear"}
                    {order.items?.length > 1 && ` + ${order.items.length - 1} more items`}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-glass-border">
                    <span className="text-xs font-black uppercase tracking-wider text-accent">
                      LKR {order.totalAmount?.toLocaleString() || "0"}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                      {toSafeLocaleString(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Arrow CTA */}
                <div className="w-10 h-10 rounded-full bg-glass group-hover:bg-accent group-hover:!text-accent-text text-primary flex items-center justify-center transition-all shrink-0">
                  <IoChevronForwardOutline size={18} />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
        />
      )}
    </>
  );
};

export default OrdersView;
