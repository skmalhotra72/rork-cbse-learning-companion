import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { supabase } from "@/lib/supabase";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const rorkApiUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (rorkApiUrl) {
    return rorkApiUrl;
  }

  if (__DEV__) {
    console.warn('⚠️ EXPO_PUBLIC_RORK_API_BASE_URL not set. Backend features will not work.');
    console.warn('To fix: Restart with backend enabled using: bun dev --tunnel');
    return 'http://localhost:3000';
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const { data: { session } } = await supabase.auth.getSession();
        return {
          authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
        };
      },
    }),
  ],
});
