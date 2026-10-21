"use client";
import React from "react";
import { Customer } from "@/interfaces";
import { Form, Input, Checkbox, Row, Col } from "antd";

const ShippingDetails = ({
  shippingSameAsBilling,
  setShippingSameAsBilling,
  shippingCustomer,
  setShippingCustomer,
}: {
  shippingSameAsBilling: boolean;
  setShippingSameAsBilling: React.Dispatch<React.SetStateAction<boolean>>;
  shippingCustomer: Partial<Customer> | null;
  setShippingCustomer: React.Dispatch<
    React.SetStateAction<Partial<Customer> | null>
  >;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingCustomer((prev) => ({
      ...(prev as Customer),
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="w-full">
      <div className="mb-6 border-b border-glass-border pb-4 flex items-center justify-between">
        <div>
          <span className="v2-section-label text-[9px] mb-0.5">BILLING &amp; NOTES</span>
          <h2 className="text-xl font-black uppercase tracking-tight text-primary m-0">
            Shipping &amp; Delivery Preferences
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <Checkbox
          id="sameAddress"
          checked={shippingSameAsBilling}
          onChange={(e) => setShippingSameAsBilling(!shippingSameAsBilling)}
          className="text-xs font-black uppercase tracking-wider text-primary"
        >
          Same as billing address
        </Checkbox>
      </div>

      {!shippingSameAsBilling && (
        <Row gutter={[16, 0]} className="w-full animate-fadeIn">
          <Col xs={24} md={12}>
            <Form.Item
              name="shippingName"
              label={
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                  Recipient Name <span className="text-error font-black ml-0.5">*</span>
                </span>
              }
              rules={[
                { required: true, message: "Please input recipient name!" },
              ]}
            >
              <Input
                placeholder="Recipient Full Name"
                onChange={handleChange}
                className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="shippingPhone"
              label={
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                  Recipient Phone <span className="text-error font-black ml-0.5">*</span>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please input shipping phone number!",
                },
              ]}
            >
              <Input
                placeholder="077 123 4567"
                onChange={handleChange}
                className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="shippingAddress"
              label={
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                  Shipping Address <span className="text-error font-black ml-0.5">*</span>
                </span>
              }
              rules={[
                { required: true, message: "Please input shipping address!" },
              ]}
            >
              <Input
                placeholder="House No, Street Name"
                onChange={handleChange}
                className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="shippingCity"
              label={
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                  City <span className="text-error font-black ml-0.5">*</span>
                </span>
              }
              rules={[{ required: true, message: "Please input city!" }]}
            >
              <Input
                placeholder="City"
                onChange={handleChange}
                className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
              />
            </Form.Item>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ShippingDetails;
