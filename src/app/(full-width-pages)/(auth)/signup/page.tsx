import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Sistem Arsip Digital Desa",
  description: "Halaman Pendaftaran Sistem Arsip Digital Desa",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
