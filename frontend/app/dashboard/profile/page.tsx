"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    memberId: "MLM-12345",
    gender: "Male",
    dateOfBirth: "1990-01-01",
    email: "john.doe@example.com",
    mobile: "+1 234 567 8900",
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    country: "USA",
    pinCode: "10001",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile updated:", formData);
    setIsEditing(false);
  };

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        icon={<User className="w-6 h-6 text-white" />}
        title="Personal Details"
        subtitle="Update your personal information"
      />

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-border">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-background shadow-lg">
              <User className="w-12 h-12 text-primary-600" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-500 text-white shadow-md hover:bg-primary-600 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-foreground">{formData.fullName}</h2>
            <p className="text-sm text-muted-foreground">Member ID: <span className="font-medium text-primary-600">{formData.memberId}</span></p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-primary-500 hover:bg-primary-600 text-white shadow-md"
          >
            {isEditing ? "Cancel Editing" : "Edit Profile"}
          </Button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label required>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label required>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({...formData, gender: value})}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label required>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  disabled={!isEditing}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary-500" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label required>Email Address</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>
              <div>
                <Label required>Mobile Number</Label>
                <Input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  disabled={!isEditing}
                  icon={<Phone className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label required>Street Address</Label>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  disabled={!isEditing}
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
              <div>
                <Label required>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label required>State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label required>Country</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label required>PIN Code</Label>
                <Input
                  value={formData.pinCode}
                  onChange={(e) => setFormData({...formData, pinCode: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <Button
                type="submit"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-6 shadow-lg shadow-primary-500/20"
              >
                Update Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="px-8 py-6 border-border hover:bg-muted"
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </div>
    </PageContainer>
  );
}
