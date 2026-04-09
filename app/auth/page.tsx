import Image from "next/image";
import { redirect } from "next/navigation";

import { AuthModal } from "@/components/auth-modal";
import { PublicHeader } from "@/components/public-header";
import { hasSupabaseCredentials } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";

type AuthPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    notice?: string;
  }>;
};

function getSafeNextPath(path?: string) {
  return path && path.startsWith("/") && !path.startsWith("//") ? path : "/profile";
}

const floatingPhotos = [
  {
    alt: "Paisaje de lago",
    className: "left-[6%] top-[34%] w-[13rem] sm:left-[7%] sm:top-[48%] sm:w-[15rem] lg:left-[6%] lg:top-[46%]",
    src: "/images/landing/lake.png",
  },
  {
    alt: "Montañas al fondo",
    className: "left-[24%] top-[10%] hidden w-[16rem] sm:block lg:left-[24%] lg:top-[16%]",
    src: "/images/landing/group.png",
  },
  {
    alt: "Jeep naranja",
    className: "bottom-[6%] left-[28%] hidden w-[18rem] sm:block lg:bottom-[8%] lg:left-[25%]",
    src: "/images/landing/car.png",
  },
];

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const [resolvedSearchParams, currentUser] = await Promise.all([searchParams, getCurrentUser()]);
  const authReady = hasSupabaseCredentials();
  const authWarning = authReady ? null : "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  const nextPath = getSafeNextPath(resolvedSearchParams.next);

  if (currentUser) {
    redirect(nextPath);
  }

  return (
    <main className="relative flex-1 overflow-x-clip bg-[#edd2bd] pb-12">
      <PublicHeader />

      <div className="pointer-events-none absolute inset-0">
        {floatingPhotos.map((photo) => (
          <div key={photo.src} className={`landing-photo absolute ${photo.className}`}>
            <Image src={photo.src} alt={photo.alt} width={430} height={430} className="h-auto w-full" />
          </div>
        ))}
      </div>

      <div className="page-shell relative z-10 flex min-h-[calc(100vh-11rem)] items-center justify-center py-12">
        <AuthModal open enabled={authReady} error={resolvedSearchParams.error} notice={resolvedSearchParams.notice} closeHref="/" disabledReason={authWarning} nextPath={nextPath} />
      </div>

      <div className="pointer-events-none fixed bottom-5 right-5 z-10 md:bottom-6 md:right-8">
        <Image src="/icons/chat.svg" alt="Chat" width={60} height={60} className="h-14 w-14 md:h-[60px] md:w-[60px]" />
      </div>
    </main>
  );
}