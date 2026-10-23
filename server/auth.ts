import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

if(!process.env.DATABASE_URL||!process.env.BETTER_AUTH_SECRET)throw new Error('Account service configuration is incomplete.');
const connection=new URL(process.env.DATABASE_URL);connection.searchParams.set('sslmode','verify-full');
export const pool=new Pool({connectionString:connection.toString(),max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000});
export const auth=betterAuth({
  database:pool,
  baseURL:process.env.BETTER_AUTH_URL,
  secret:process.env.BETTER_AUTH_SECRET,
  emailAndPassword:{enabled:true,minPasswordLength:10,maxPasswordLength:128},
  rateLimit:{enabled:true,storage:'database',window:60,max:60,customRules:{'/sign-in/email':{window:60,max:5},'/sign-up/email':{window:60,max:5}}},
  user:{deleteUser:{enabled:true}},
  session:{expiresIn:60*60*24*30,updateAge:60*60*24},
  account:{accountLinking:{enabled:false}}
});
