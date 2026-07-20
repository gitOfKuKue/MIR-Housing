'use client';

import ChangePasswordForm from '@/src/components/settings/ChangePasswordForm';
import CreateUserForm from '@/src/components/settings/CreateUserForm';
import ManageUsersForm from '@/src/components/settings/ManageUsersForm';
import SettingsAccordionSection from '@/src/components/settings/SettingsAccordionSection';
import { LanguageSwitcher, useTranslations } from '@/src/i18n';
import { getAuthUser } from '@/src/lib/auth';
import { canCreateAccounts } from '@/src/lib/roles';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const t = useTranslations();
  const [showCreateUser, setShowCreateUser] = useState(false);

  useEffect(() => {
    setShowCreateUser(canCreateAccounts(getAuthUser()?.role));
  }, []);

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">{t('settings.title')}</h1>
      <p className="mt-2 text-sm text-[#6b7280]">{t('settings.subtitle')}</p>

      <div className="mt-8 max-w-3xl space-y-4">
        <SettingsAccordionSection
          title={t('settings.language')}
          description={t('settings.languageHint')}
          defaultOpen
        >
          <LanguageSwitcher />
        </SettingsAccordionSection>

        <SettingsAccordionSection
          title={t('settings.changePassword')}
          description={t('settings.changePasswordHint')}
        >
          <ChangePasswordForm />
        </SettingsAccordionSection>

        {showCreateUser ? (
          <>
            <SettingsAccordionSection
              title={t('settings.createUser')}
              description={t('settings.createUserHint')}
            >
              <CreateUserForm />
            </SettingsAccordionSection>

            <SettingsAccordionSection
              title={t('settings.manageUsers')}
              description={t('settings.manageUsersHint')}
            >
              <ManageUsersForm />
            </SettingsAccordionSection>
          </>
        ) : null}
      </div>
    </div>
  );
}
