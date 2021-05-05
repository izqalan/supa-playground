import { createClient, Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON
);

async function handleGithubSignIn() {
  const { user, session, error } = await supabase.auth.signIn({
    provider: 'github'
  });
}

async function signout() {
  const { error } = supabase.auth.signOut()
}

async function getUserSubscription(userId) {
  // get foriegn table subscription
  let { data, error } = await supabase
    .from('users')
    .select(`
      *,
      Subscription (
        id,
        SubsName,
        Price
      )
    `).eq('id', userId)
    ;
  return data;
}

export default function Home() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  useEffect(() => {
    const session = supabase.auth.session();
    setSession(session);
    setUser(session?.user ?? null);
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })
    return () => {
      authListener.unsubscribe()
    }
  });
  return (
    <div className="flex flex-col">
      <p className="flex text-2xl item-center justify-center font-semibold tracking-wide px-24 pt-24" >Supa Playground</p>
      <p className="flex text-2xl item-center justify-center tracking-wide p-10">{user ? `Welcome, ${user.email}` : "Sign in to continue"}</p>
      <div className="flex flex-col item-center justify-center lg:mx-64 lg:px-64">
        {session && <div className="flex flex-col">
          <p className="flex item-center justify-center font-semibold pb-2">Subscription tier: {subscription}</p>
          <button className="border rounded my-2" onClick={signout}>
            Sign out
        </button>
          <button className="border rounded my-2" onClick={async () => {
            let subs = await getUserSubscription('3273f6f7-7560-4c59-82b0-004492ac3023');
            setSubscription(subs[0].Subscription.SubsName);
          }}>
            get user detail
        </button>
        </div>
        }
        {!session &&
          <button onClick={handleGithubSignIn}>
            Sign in with Github
          </button>
        }

      </div>
    </div>
  )
}
