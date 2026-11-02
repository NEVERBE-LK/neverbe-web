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
        <div className="border-b border-glass-border pb-4 sm:pb-6">
          <span className="v2-section-label mb-1">PURCHASES</span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-primary m-0">
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
                className="v2-glass p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-glass-border hover:border-accent transition-all duration-300 group cursor-pointer flex flex-row items-center gap-3 sm:gap-6"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl bg-accent-text shrink-0 overflow-hidden border border-glass-border p-1 flex items-center justify-center relative">
                  <Image
                    width={80}
                    height={80}
                    src={
                      order.items?.[0]?.thumbnail ||
                      "/collection-placeholder.png"
                    }
                    alt="Product"
                    className="w-full h-full object-cover rounded-lg sm:rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                  <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <h3 className="text-sm sm:text-base font-black uppercase text-primary m-0">
                        {order.status || "PROCESSING"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      {((order.paymentMethod || "").toLowerCase().includes("cod") ||
                        (order.paymentMethod || "").toLowerCase().includes("cash on delivery")) &&
                        order.riskStatus === 'HIGH_RISK' &&
                        !order.deliveryFeePrepaid && (
                          <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30 text-[9px] font-bold uppercase tracking-wider">
                            ⚠️ PREPAID FEE PENDING
                          </span>
                        )}
                      {((order.paymentMethod || "").toLowerCase().includes("cod") ||
                        (order.paymentMethod || "").toLowerCase().includes("cash on delivery")) &&
                        order.riskStatus === 'HIGH_RISK' &&
                        order.deliveryFeePrepaid && (
                          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 text-[9px] font-bold uppercase tracking-wider">
                            ✓ FEE PAID
                          </span>
                        )}
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-muted truncate max-w-[120px] sm:max-w-none">
                        {order.id?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-secondary m-0 mb-2 sm:mb-3 truncate">
                    {order.items?.[0]?.name || "Neverbe Gear"}
                    {order.items?.length > 1 && ` + ${order.items.length - 1} more items`}
                  </p>

                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-glass-border">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-accent">
                      LKR {order.totalAmount?.toLocaleString() || "0"}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-muted">
                      {toSafeLocaleString(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Arrow CTA */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-glass group-hover:bg-accent group-hover:!text-accent-text text-primary flex items-center justify-center transition-all shrink-0">
                  <IoChevronForwardOutline size={16} />
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
