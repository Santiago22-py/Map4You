import Image from "next/image";
import Link from "next/link";

import { HeaderShortcuts } from "@/components/header-shortcuts";
import { hasSupabaseCredentials } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";

export async function PublicHeader() {
  const currentUser = await getCurrentUser();
  const authEnabled = hasSupabaseCredentials();
  const authWarning = authEnabled ? null : "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY.";

  return (
    <>
      <header className="page-shell flex items-center justify-between gap-4 px-1 pt-6 md:pt-10">
        <Link href="/" className="shrink-0 w-[132px] md:w-[168px]">
          <Image
            src="/icons/logo.svg"
            alt="Map 4 You"
            width={170}
            height={48}
            loading="eager"
            className="w-full"
            style={{ height: "auto" }}
          />
        </Link>

        <HeaderShortcuts currentUser={Boolean(currentUser)} currentUserId={currentUser?.id ?? null} authEnabled={authEnabled} authWarning={authWarning} />
      </header>

      <div className="mt-6 w-full border-t border-brand-navy/25 shadow-[0_2px_10px_rgba(10,48,120,0.09)] md:mt-8" />
    </>
  );
}