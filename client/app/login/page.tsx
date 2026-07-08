import LoginForm from '@/src/components/auth/LoginForm';
import Image from 'next/image';
import houseSearchingImage from '@/src/assets/images/House searching-cuate.svg';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1e4636] px-4 py-10">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[1rem] bg-[#f7f4ef] shadow-2xl md:min-h-[700px] md:flex-row">
        <div className="flex flex-1 items-center px-8 py-10 sm:px-10 sm:py-12">
          <LoginForm />
        </div>

        <div className="flex flex-1 items-center justify-center border-t border-[#e8e4dc] p-8 md:border-l md:border-t-0 md:p-10">
          <Image
            src={houseSearchingImage}
            alt="House searching illustration"
            className="h-auto w-full max-w-md object-contain"
            priority
          />
        </div>
      </div>
    </main>
  );
}
