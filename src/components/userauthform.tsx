'use client';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Icons } from './icons';
import { useToast } from '@/hooks/use-toast';

type UserAuthFormProps = {
  className?: string;
} & React.HtmlHTMLAttributes<HTMLDivElement>;

export default function UserAuthForm({ className = '', ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  async function loginWithGoogle() {
    setIsLoading(true);

    try {
      await signIn('google');
    } catch (error) {
      console.log(error);
      toast({
        title: 'There was a problem',
        description: 'There was an error logging in with Google',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('flex justify-center', className)} {...props}>
      <Button size={'sm'} className='w-full' onClick={loginWithGoogle} isLoading={isLoading}>
        {isLoading ? null : <Icons.google className='w-6 h-6 mr-2' />}Google
      </Button>
    </div>
  );
}
