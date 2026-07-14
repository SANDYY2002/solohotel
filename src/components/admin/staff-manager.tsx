"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Shield, User, Key } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast-provider";
import { formatDate } from "@/lib/utils";

type Staff = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export function StaffManager({ initial, currentStaffId }: { initial: Staff[]; currentStaffId: string }) {
  const router = useRouter();
  const showToast = useToast();
  const [staff, setStaff] = React.useState(initial);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newRole, setNewRole] = React.useState("STAFF");
  const [error, setError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Staff | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [resetTarget, setResetTarget] = React.useState<Staff | null>(null);
  const [resetPassword, setResetPassword] = React.useState("");
  const [resetting, setResetting] = React.useState(false);

  async function refresh() {
    const res = await fetch("/api/admin/staff");
    if (res.ok) setStaff(await res.json());
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail, password: newPassword, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      showToast("success", `${newName} added.`);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("STAFF");
      setShowAddForm(false);
      await refresh();
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(member: Staff) {
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !member.active }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error ?? "Couldn't update that account.");
        return;
      }
      showToast("success", `${member.name} ${data.active ? "reactivated" : "deactivated"}.`);
      await refresh();
    } catch {
      showToast("error", "Could not reach the server.");
    }
  }

  async function toggleRole(member: Staff) {
    const nextRole = member.role === "OWNER" ? "STAFF" : "OWNER";
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error ?? "Couldn't update that account.");
        return;
      }
      showToast("success", `${member.name} is now ${nextRole === "OWNER" ? "an Owner" : "Staff"}.`);
      await refresh();
    } catch {
      showToast("error", "Could not reach the server.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/staff/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error ?? "Couldn't delete that account.");
        setDeleting(false);
        return;
      }
      showToast("success", `${deleteTarget.name} removed.`);
      setDeleteTarget(null);
      await refresh();
    } catch {
      showToast("error", "Could not reach the server.");
    } finally {
      setDeleting(false);
    }
  }

  async function confirmResetPassword() {
    if (!resetTarget) return;
    if (resetPassword.length < 8) {
      showToast("error", "Password must be at least 8 characters.");
      return;
    }
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/staff/${resetTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: resetPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error ?? "Couldn't reset that password.");
        setResetting(false);
        return;
      }
      showToast("success", `Password reset for ${resetTarget.name}.`);
      setResetTarget(null);
      setResetPassword("");
    } catch {
      showToast("error", "Could not reach the server.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-stone-500">{staff.length} account{staff.length !== 1 ? "s" : ""}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add staff account
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="mt-4 grid gap-4 rounded-sm border border-stone-200 p-5 sm:grid-cols-2 dark:border-stone-800">
          <div>
            <Label htmlFor="newName">Name</Label>
            <Input id="newName" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="newEmail">Email</Label>
            <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="newPassword">Password</Label>
            <Input id="newPassword" type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="newRole">Role</Label>
            <Select id="newRole" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="STAFF">Staff</option>
              <option value="OWNER">Owner</option>
            </Select>
          </div>
          {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" variant="bronze" disabled={adding}>
              {adding && <Loader2 className="h-4 w-4 animate-spin" />}
              {adding ? "Adding…" : "Add account"}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-4 divide-y divide-stone-200 rounded-sm border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
        {staff.map((member) => (
          <div key={member.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
            <div className="min-w-[10rem] flex-1">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                {member.name}
                {member.id === currentStaffId && <span className="text-xs text-stone-400">(you)</span>}
              </p>
              <p className="text-xs text-stone-500">{member.email}</p>
            </div>

            <button
              type="button"
              onClick={() => toggleRole(member)}
              disabled={member.id === currentStaffId}
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-wide disabled:opacity-40 ${
                member.role === "OWNER"
                  ? "border-bronze-400 bg-bronze-400/10 text-bronze-600 dark:text-bronze-300"
                  : "border-stone-300 text-stone-500 dark:border-stone-700"
              }`}
              title={member.id === currentStaffId ? "Can't change your own role" : "Click to toggle role"}
            >
              {member.role === "OWNER" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {member.role}
            </button>

            <span className={`rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wide ${member.active ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-stone-200 text-stone-500 dark:bg-stone-800"}`}>
              {member.active ? "Active" : "Deactivated"}
            </span>

            <span className="text-xs text-stone-400">
              {member.lastLoginAt ? `Last in ${formatDate(member.lastLoginAt)}` : "Never signed in"}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setResetTarget(member)}
                className="rounded-sm p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/5"
                title="Reset password"
              >
                <Key className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toggleActive(member)}
                disabled={member.id === currentStaffId}
                className="rounded-sm px-2 py-1 text-xs text-stone-500 hover:bg-stone-100 disabled:opacity-40 dark:hover:bg-white/5"
              >
                {member.active ? "Deactivate" : "Reactivate"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(member)}
                disabled={member.id === currentStaffId}
                className="rounded-sm p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/30"
                title="Delete account"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this account?"
        description={`${deleteTarget?.name} will lose access immediately. This can't be undone.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {resetTarget && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-sm border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-conservatory-900">
            <h2 className="font-display text-lg">Reset password for {resetTarget.name}</h2>
            <div className="mt-4">
              <Label htmlFor="resetPassword">New password</Label>
              <Input
                id="resetPassword"
                type="password"
                minLength={8}
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { setResetTarget(null); setResetPassword(""); }} disabled={resetting}>
                Cancel
              </Button>
              <Button type="button" variant="bronze" size="sm" onClick={confirmResetPassword} disabled={resetting}>
                {resetting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {resetting ? "Resetting…" : "Reset password"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
