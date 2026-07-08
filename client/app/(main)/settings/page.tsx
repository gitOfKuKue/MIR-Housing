import ChangePasswordForm from '@/src/components/settings/ChangePasswordForm';

export default function SettingsPage() {
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">Settings</h1>
      <p className="mt-2 text-sm text-[#6b7280]">
        Manage your account preferences.
      </p>

      <div className="mt-8 max-w-3xl">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
