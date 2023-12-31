import Link from 'next/link';
import { toast } from './use-toast';
import { buttonVariants } from '@/components/ui/button';

export default function useCustomToast() {
  const loginToast = () => {
    const { dismiss } = toast({
      title: 'Login required.',
      description: 'You need to be logged in to do that.',
      variant: 'destructive',
      action: (
        <Link className={buttonVariants({ variant: 'secondary' })} href='/sign-in' onClick={() => dismiss()}>
          Login
        </Link>
      ),
    });
  };

  return { loginToast };
}
