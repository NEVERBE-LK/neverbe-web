"use client";

import React, { useState } from "react";
import { Form, Input, Button, Row, Col } from "antd";
import {
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "@/firebase/firebaseClient";
import { setUser } from "@/redux/authSlice/authSlice";
import {
  IoPersonOutline,
  IoLockClosedOutline,
} from "react-icons/io5";

const AccountSettings = ({ user, dispatch }: { user: any; dispatch: any }) => {
  const ProfileForm = () => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (values: any) => {
      setIsUpdating(true);
      const fName = values.fName;
      const lName = values.lName;

      try {
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName: `${fName} ${lName}`.trim(),
          });
          await auth.currentUser.reload();
          toast.success("Profile Updated Successfully");

          const updatedUser = {
            ...user,
            displayName: auth.currentUser.displayName,
          };
          dispatch(setUser(updatedUser));
        }
      } catch (err: any) {
        toast.error("Error updating profile");
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <div className="v2-glass p-8 rounded-3xl border border-glass-border hover:border-accent transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
            <IoPersonOutline size={20} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-primary m-0">
            Personal Profile
          </h3>
        </div>

        <Form
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={{
            fName: user?.displayName ? user.displayName.split(" ")[0] : "",
            lName:
              user?.displayName && user.displayName.split(" ").length > 1
                ? user.displayName.split(" ")[1]
                : "",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="fName" rules={[{ required: true, message: "First name" }]}>
                <Input
                  placeholder="FIRST NAME"
                  className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="lName" rules={[{ required: true, message: "Last name" }]}>
                <Input
                  placeholder="LAST NAME"
                  className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
                />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            loading={isUpdating}
            className="h-12 px-8 rounded-full bg-accent! !text-accent-text font-black uppercase tracking-widest text-xs border-none mt-2 cursor-pointer shadow-md"
          >
            Update Details
          </Button>
        </Form>
      </div>
    );
  };

  const SecurityForm = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [form] = Form.useForm();

    const handlePasswordChange = async (values: any) => {
      setIsUpdating(true);
      const { currentPassword, newPassword } = values;

      if (!auth.currentUser || !auth.currentUser.email) {
        toast.error("User session invalid.");
        setIsUpdating(false);
        return;
      }

      try {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          currentPassword,
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);

        toast.success("Password changed successfully");
        form.resetFields();
      } catch (err: any) {
        toast.error(err.message || "Failed to update password");
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <div className="v2-glass p-8 rounded-3xl border border-glass-border hover:border-accent transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
            <IoLockClosedOutline size={20} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-primary m-0">
            Security &amp; Password
          </h3>
        </div>

        <Form form={form} layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item
            name="currentPassword"
            rules={[{ required: true, message: "Enter current password" }]}
          >
            <Input.Password
              placeholder="CURRENT PASSWORD"
              className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: "Enter new password" },
              { min: 6, message: "At least 6 characters" },
            ]}
          >
            <Input.Password
              placeholder="NEW PASSWORD"
              className="h-12 rounded-2xl bg-glass! border-glass-border! text-primary! font-bold text-xs"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isUpdating}
            className="h-12 px-8 rounded-full bg-accent! !text-accent-text font-black uppercase tracking-widest text-xs border-none mt-2 cursor-pointer shadow-md"
          >
            Update Password
          </Button>
        </Form>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-glass-border pb-6">
        <span className="v2-section-label mb-1">SECURITY &amp; PREFERENCES</span>
        <h2 className="text-3xl font-black uppercase tracking-tight text-primary m-0">
          Account Settings
        </h2>
      </div>

      <div className="space-y-8">
        <ProfileForm />
        {!user?.isAnonymous && <SecurityForm />}
      </div>
    </div>
  );
};

export default AccountSettings;
