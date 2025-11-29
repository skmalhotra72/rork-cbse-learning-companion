import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createClient } from "@supabase/supabase-js";
import { UserRole } from "../types/auth";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
      auth: {
        persistSession: false,
      },
    }
  );

  const authHeader = opts.req.headers.get('authorization');
  let userId: string | null = null;
  let userEmail: string | null = null;
  let userRole: UserRole | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (!error && user) {
      userId = user.id;
      userEmail = user.email || null;
      
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      userRole = (userData?.role as UserRole) || null;
    }
  }

  return {
    req: opts.req,
    supabase,
    userId,
    userEmail,
    userRole,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  
  if (!ctx.userId || !ctx.userRole) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      userEmail: ctx.userEmail!,
      userRole: ctx.userRole,
    },
  });
});

export const studentProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.userRole !== 'student') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Student access required',
    });
  }
  return opts.next();
});

export const parentProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.userRole !== 'parent') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Parent access required',
    });
  }
  return opts.next();
});

export const adminProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.userRole !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return opts.next();
});
