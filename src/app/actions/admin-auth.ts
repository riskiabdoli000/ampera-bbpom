"use server";

import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth/password";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginState = {
  success: boolean;
  error?: string;
};

export async function loginAdminAction(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Input tidak valid",
    };
  }

  const { username, password } = validated.data;

  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return {
        success: false,
        error: "Username atau password salah.",
      };
    }

    if (!admin.isAktif) {
      return {
        success: false,
        error: "Akun ini telah dinonaktifkan. Hubungi Superadmin.",
      };
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return {
        success: false,
        error: "Username atau password salah.",
      };
    }

    await createSession({
      id: admin.id,
      username: admin.username,
      nama: admin.nama,
      role: admin.role,
    });

    return { success: true };
  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan pada server saat proses login.",
    };
  }
}

export async function logoutAdminAction() {
  await deleteSession();
  redirect("/admin/login");
}

export async function getCurrentAdmin() {
  return await getSession();
}
