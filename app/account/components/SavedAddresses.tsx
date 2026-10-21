"use client";

import React, { useState } from "react";
import { Form, Input, Button, Row, Col } from "antd";
import toast from "react-hot-toast";
import { auth } from "@/firebase/firebaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoMapOutline,
  IoCardOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoPencilOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import axiosInstance from "@/actions/axiosInstance";

interface Address {
  type: "Shipping" | "Billing";
  address: string;
  city: string;
  phone: string;
}

interface SavedAddressesProps {
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  user: any;
}

const SavedAddresses: React.FC<SavedAddressesProps> = ({
  addresses,
  setAddresses,
  user,
}) => {
  const AddressCard = ({ type }: { type: "Shipping" | "Billing" }) => {
    const existing = addresses.find((a) => a.type === type);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [form] = Form.useForm();
    const handleSave = async (values: any) => {
      setIsSaving(true);

      const newAddress = {
        type,
        address: values.address,
        city: values.city,
        phone: values.phone,
      };

      try {
        const token = await auth.currentUser?.getIdToken();
        const formData = new FormData();
        formData.append("data", JSON.stringify(newAddress));
        const res = await axiosInstance.post(
          "/web/customers/addresses",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.data) {
          const updated = addresses.filter((a) => a.type !== type);
          setAddresses([...updated, newAddress]);
          toast.success(`${type} Address Updated`);
          setIsEditing(false);
        }
      } catch (err) {
        toast.error("Failed to save address");
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="h-full">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="v2-glass p-6 rounded-3xl border border-glass-border"
            >
              <Form
                form={form}
                layout="vertical"
                className="space-y-4"
                onFinish={handleSave}
                initialValues={{
                  address: existing?.address,
                  city: existing?.city,
                  phone: existing?.phone,
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-black text-primary uppercase tracking-tight m-0">
                    Edit {type} Address
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-muted hover:text-primary transition-colors p-0 border-none bg-transparent cursor-pointer"
                  >
                    <IoCloseOutline size={22} />
                  </button>
                </div>

                <Form.Item
                  name="address"
                  rules={[{ required: true, message: "Required" }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Street Address"
                    className="w-full h-12 rounded-2xl bg-glass border-glass-border text-primary font-bold text-xs"
                  />
                </Form.Item>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="city"
                    rules={[{ required: true, message: "Required" }]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="City"
                      className="w-full h-12 rounded-2xl bg-glass border-glass-border text-primary font-bold text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    rules={[{ required: true, message: "Required" }]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="Phone Number"
                      className="w-full h-12 rounded-2xl bg-glass border-glass-border text-primary font-bold text-xs"
                    />
                  </Form.Item>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSaving}
                  className="w-full h-12 rounded-full bg-accent! !text-accent-text font-black uppercase text-xs tracking-widest border-none mt-2 cursor-pointer shadow-md"
                >
                  Save Address
                </Button>
              </Form>
            </motion.div>
          ) : (
            <motion.div key="display" className="h-full">
              <div className="v2-glass p-6 rounded-3xl border border-glass-border hover:border-accent transition-all duration-300 flex flex-col justify-between h-full min-h-[220px] relative group">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                      {type === "Shipping" ? (
                        <IoMapOutline size={20} />
                      ) : (
                        <IoCardOutline size={20} />
                      )}
                    </div>
                    <h3 className="font-black text-base uppercase tracking-tight text-primary m-0">
                      {type} Address
                    </h3>
                  </div>

                  {existing ? (
                    <div className="space-y-1">
                      <p className="text-sm font-extrabold text-primary m-0">
                        {existing.address}
                      </p>
                      <p className="text-xs text-secondary m-0">
                        {existing.city}
                      </p>
                      <p className="text-xs font-black text-accent uppercase tracking-wider mt-2 m-0">
                        {existing.phone}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted m-0">
                      {user?.isAnonymous
                        ? "Registered customers can save multiple addresses here."
                        : "No address saved yet"}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    disabled={user?.isAnonymous}
                    onClick={() => setIsEditing(true)}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all bg-transparent border-none p-0 cursor-pointer ${
                      user?.isAnonymous
                        ? "text-muted cursor-not-allowed opacity-60"
                        : "text-accent hover:underline"
                    }`}
                  >
                    {user?.isAnonymous ? (
                      <IoLockClosedOutline size={14} />
                    ) : (
                      <IoPencilOutline size={14} />
                    )}
                    <span>{existing ? "Change Address" : "Add Address"}</span>
                  </button>
                </div>

                {existing && (
                  <div className="absolute top-6 right-6 text-accent">
                    <IoCheckmarkCircleOutline size={22} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-glass-border pb-6">
        <span className="v2-section-label mb-1">DELIVERY DESTINATIONS</span>
        <h2 className="text-3xl font-black uppercase tracking-tight text-primary m-0">
          Saved Addresses
        </h2>
        <p className="text-xs text-secondary font-medium mt-1 m-0">
          Manage your delivery &amp; billing locations for fast 1-click checkout.
        </p>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} md={12}>
          <AddressCard type="Shipping" />
        </Col>
        <Col xs={24} md={12}>
          <AddressCard type="Billing" />
        </Col>
      </Row>
    </div>
  );
};

export default SavedAddresses;
