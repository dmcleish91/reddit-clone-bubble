'use client';
import { User } from 'next-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import UserAvatar from './useravatar';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

type UserAccountNavProps = {
  user: Pick<User, 'name' | 'image' | 'email'> & {
    username?: string | null;
  };
};

export default function UserAccountNav({ user }: UserAccountNavProps) {
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar className='h-8 w-8' user={{ name: user.username || null, image: user.image || null }} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='bg-white' align='end'>
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-1 leading-none'>
            {user.name && <p className='font-medium'> {user.username} </p>}
            {user.email && <p className='w-[200px] truncate text-sm text-zinc-700'> {user.email} </p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/'>Feed</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='r/create'>Create Community</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/settings'>Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            setLoggingOut((prev) => !prev);
            signOut({
              callbackUrl: `${window.location.origin}/sign-in`,
            });
          }}
          className='cursor-pointer'>
          {loggingOut ? 'See you later!' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
