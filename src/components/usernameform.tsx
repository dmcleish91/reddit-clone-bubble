'use client';

import { toast } from '@/hooks/use-toast';
import { UsernameRequest, UsernameValidator } from '@/lib/validators/username';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useRouter } from 'next/navigation';

type UsernameFormProps = {
  user: Pick<User, 'id' | 'username'>;
};

export default function UsernameForm({ user }: UsernameFormProps) {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || '',
    },
  });

  const { mutate: updateUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: UsernameRequest) => {
      const payload: UsernameRequest = { name };

      const { data } = await axios.patch('/api/username', payload);
      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          return toast({
            title: 'Username already taken.',
            description: 'Please choose a different username.',
            variant: 'destructive',
          });
        }
      }

      toast({
        title: 'There was an error.',
        description: 'Could not save username.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        description: 'Your username has been updated!',
      });
      router.refresh();
    },
  });
  return (
    <form
      onSubmit={handleSubmit((e) => {
        updateUsername(e);
      })}>
      <Card>
        <CardHeader>
          <CardTitle>Your Username</CardTitle>
          <CardDescription>Please enter a new username.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className='relative grid gap-1'>
            <div className='absolute top-[0.5px] left-4 w-4 h-10 grid place-items-center '>
              <span className='text-sm text-zinc-400'>u/</span>
            </div>
            <Label className='sr-only' htmlFor='name'>
              Name
            </Label>
            <Input id='name' className='w-[400px] pl-8' size={32} {...register('name')} />
            {errors?.name && <p className='px-1 text-xs text-red-600'>{errors.name.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button isLoading={isLoading}>Change name</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
