import { HomePage } from "@/components/home/HomePage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  let loggedIn = false;
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    loggedIn = Boolean(data.user);
  }
  return <HomePage showSignupCta={!loggedIn} />;
}
