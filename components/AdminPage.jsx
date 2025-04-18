"use client"
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";


export default function AdminPage() {
    const { data: session } = useSession();
    return (
        <div className="grid place-items-center h-screen">
            <div className="shadow-lg p-8 bg-zinc-300/10 flex flex-col gap-2 my-6">
                <h1 className="text-3xl font-bold">Admin Page</h1>
                <p className="text-lg">This is the admin page.</p>
                <div>
                          Name: <span className="font-bold">{session?.user?.name}</span>
                        </div>
                        <button
                            onClick={() => signOut()}
                          className="bg-red-500 text-white font-bold px-6 py-2 mt-3"
                        >
                          Log Out
                        </button>
            </div>
        </div>
    );
}