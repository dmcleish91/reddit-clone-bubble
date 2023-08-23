'use client';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { Prisma, Subreddit } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function SearchBar() {
  const [input, setInput] = useState<string>('');
  const router = useRouter();
  const {
    data: results,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    queryKey: ['search-query'],
    enabled: false,
  });

  const request = debounce(() => {
    refetch();
  }, 300);

  const debounceRequest = useCallback(() => {
    request();
  }, []);

  const commandRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(commandRef, () => {
    setInput('');
  });

  const pathname = usePathname();

  useEffect(() => {
    setInput('');
  }, [pathname]);

  return (
    <Command ref={commandRef} className='relative rounded-lg border z-50 h-fit max-w-sm overflow-visible'>
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceRequest();
        }}
        className='h-10 outline-none border-none focus:border-none focus:outline-none ring-0'
        placeholder='Search...'
      />

      {input.length > 0 ? (
        <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-lg mt-0.5'>
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(results?.length ?? 0) > 0 ? (
            <CommandGroup heading='Communities'>
              {results?.map((subreddit) => {
                return (
                  <CommandItem
                    key={subreddit.id}
                    value={subreddit.name}
                    onSelect={(e) => {
                      router.push(`/r/${e}`);
                      router.refresh;
                    }}>
                    <Users className='mr-2 h-4 w-4' />
                    <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
}
