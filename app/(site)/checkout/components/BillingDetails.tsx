"use client";
import React from "react";
import { Customer } from "@/interfaces";
import { Form, Input, Checkbox, Row, Col } from "antd";

interface BillingDetailsProps {
  saveAddress: boolean;
  setSaveAddress: React.Dispatch<React.SetStateAction<boolean>>;
  customer: Customer | null;
  onPhoneBlur?: (phone: string) => void;
}

const BillingDetails: React.FC<BillingDetailsProps> = ({
  saveAddress,
  setSaveAddress,
  customer,
  onPhoneBlur,
}) => {
  return (
    <div className="w-full">
      <div className="mb-6 border-b border-glass-border pb-4">
        <span className="v2-section-label text-[9px] mb-0.5">CONTACT &amp; SHIPPING</span>
        <h2 className="text-xl font-black uppercase tracking-tight text-primary m-0">
          Delivery Address
        </h2>
      </div>

      <Row gutter={[16, 0]} className="w-full">
        <Col xs={24} md={12}>
          <Form.Item
            name="first_name"
            label={
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                First Name <span className="text-error font-black ml-0.5">*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please input your first name!" },
            ]}
          >
            <Input
              placeholder="John"
              className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="last_name"
            label={
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                Last Name <span className="text-error font-black ml-0.5">*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please input your last name!" },
            ]}
          >
            <Input
              placeholder="Doe"
              className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            name="address"
            label={
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                Street Address <span className="text-error font-black ml-0.5">*</span>
              </span>
            }
            rules={[{ required: true, message: "Please input your address!" }]}
          >
            <Input
              placeholder="House No, Street Name, Apartment"
              className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="city"
            label={
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                City <span className="text-error font-black ml-0.5">*</span>
              </span>
            }
            rules={[{ required: true, message: "Please input your city!" }]}
          >
            <Input
              placeholder="Colombo"
              className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="phone"
            label={
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                Phone Number <span className="text-error font-black ml-0.5">*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please input your phone number!" },
            ]}
          >
            <Input
              placeholder="077 123 4567"
              onBlur={(e) => onPhoneBlur && onPhoneBlur(e.target.value)}
              className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            name="email"
            label={
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                Email Address <span className="text-error font-black ml-0.5">*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please input your email address!" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input
              placeholder="your@email.com"
              className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Checkbox
            checked={saveAddress}
            onChange={(e) => setSaveAddress(e.target.checked)}
            className="text-xs font-bold text-secondary uppercase tracking-wider"
          >
            Save this address for fast 1-click checkout
          </Checkbox>
        </Col>
      </Row>
    </div>
  );
};

export default BillingDetails;
