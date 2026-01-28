import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Sistem Arsip Digital Desa",
  description: "Halaman Login Sistem Arsip Digital Desa",
};

export default function SignIn() {
  return <SignInForm />;
}
