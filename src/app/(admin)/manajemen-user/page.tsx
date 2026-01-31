"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  getUsers,
  createUser,
  updateUserRole,
  deleteUser,
  UserData,
} from "@/services/users";
import { dummyUsers } from "@/data/dummy";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { TrashBinIcon, PencilIcon, PlusIcon } from "@/icons";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";

export default function UserManagementPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // Form Data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("pengguna");
  
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const roleOptions = [
    { value: "administrator", label: "Administrator" },
    { value: "pengelola_arsip", label: "Pengelola Arsip" },
    { value: "pengguna", label: "Pengguna" },
  ];

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else {
        // Temporarily allow all users to access for development
        fetchData();
      }
    }
  }, [user, role, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data.length > 0 ? data : dummyUsers);
    } catch (err) {
      console.error(err);
      setUsers(dummyUsers);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setSelectedRole("pengguna");
    setError("");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (userData: UserData) => {
    setCurrentUser(userData);
    setSelectedRole(userData.role);
    setError("");
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (userData: UserData) => {
    setCurrentUser(userData);
    setIsDeleteModalOpen(true);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    try {
      await createUser({
        email,
        firstName,
        lastName,
        role: selectedRole
      }, password);
      await fetchData();
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Gagal membuat user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setActionLoading(true);
    setError("");

    try {
      await updateUserRole(currentUser.id, selectedRole);
      await fetchData();
      setIsEditModalOpen(false);
      setCurrentUser(null);
    } catch (err: any) {
      setError(err.message || "Gagal mengupdate role.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    setActionLoading(true);
    try {
      await deleteUser(currentUser.id);
      await fetchData();
      setIsDeleteModalOpen(false);
      setCurrentUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "administrator": return "success";
      case "pengelola_arsip": return "warning";
      default: return "light";
    }
  };

  const formatRole = (role: string) => {
     return role.replace("_", " ").toUpperCase();
  };

  if (authLoading || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div>
      <PageBreadCrumb pageTitle="Manajemen User" />
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleOpenAddModal}
            startIcon={<PlusIcon className="size-5" />}
          >
            Tambah User
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead className="border-b border-gray-100 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Nama</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Bergabung</th>
                  <th className="px-6 py-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((userData) => (
                  <tr key={userData.id}>
                    <td className="px-6 py-4 text-gray-800 dark:text-white/90">
                      <div className="flex flex-col">
                        <span className="font-medium">{userData.firstName} {userData.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {userData.email}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={getRoleBadgeColor(userData.role)}>
                        {formatRole(userData.role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {userData.createdAt
                        ? new Date(
                            typeof userData.createdAt === "string"
                              ? userData.createdAt
                              : (userData.createdAt as any).toDate
                              ? (userData.createdAt as any).toDate()
                              : userData.createdAt
                          ).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(userData)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-white"
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(userData)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-700 dark:border-gray-800 dark:hover:bg-red-900/20"
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-[500px] p-6">
        <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">
          Tambah User Baru
        </h3>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Nama Depan"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <InputField
              label="Nama Belakang"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <InputField
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={(value) => setSelectedRole(value)}
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)} type="button">
              Batal
            </Button>
            <Button size="sm" type="submit" disabled={actionLoading}>
              {actionLoading ? "Menambahkan..." : "Tambah User"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="max-w-[500px] p-6">
        <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">
          Edit Role User
        </h3>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <form onSubmit={handleUpdateRole} className="space-y-4">
          <div>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Mengubah role untuk: <strong>{currentUser?.email}</strong>
            </p>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={(value) => setSelectedRole(value)}
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} type="button">
              Batal
            </Button>
            <Button size="sm" type="submit" disabled={actionLoading}>
              {actionLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-[400px] p-6">
        <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white/90">
          Hapus User
        </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Apakah Anda yakin ingin menghapus user <strong>{currentUser?.email}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
            Batal
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? "Menghapus..." : "Hapus User"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
