import { Link } from "react-router";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-teal-700">Reset Password</h1>
        <p className="mt-4 text-sm text-gray-500">
          Password reset will be available in a future update.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          For now, please contact support if you need to reset your password.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
