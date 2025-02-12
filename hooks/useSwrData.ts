import useSWR, { SWRConfiguration } from 'swr';
import axios, { AxiosError } from 'axios';

const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('error:', error);
    throw error;
  }
};

export const useSwrData = <T>(endpoint: string | null) => {
  const swrOptions: SWRConfiguration = {
    fetcher,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    revalidateOnMount: true,
    onError: (error: Error) => {
      console.error("An error occurred:", error);
    },
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      if (retryCount >= 3) return;
      setTimeout(() => revalidate({ retryCount }), 5000);
    },
  };

  const { data, error, mutate, isValidating, isLoading } = useSWR<T>(endpoint, swrOptions);

  return {
    data,
    isLoading,
    isValidating,
    isError: error as AxiosError,
    mutate,
  };
};
