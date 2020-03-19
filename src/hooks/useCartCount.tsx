import { useState, useEffect } from 'react';
import pRetry from 'p-retry';
import axios, { CancelToken, OAuthRequestType } from 'src/utils/axios';
import sentry from 'src/utils/sentry';
import { LoggedUser } from 'src/types/account';

const { captureException } = sentry();

export const useCartCount = (loggedUserInfo: LoggedUser) => {
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const source = CancelToken.source();
    const requestCartCount = async () => {
      try {
        const result = await pRetry(
          () => axios.get('/api/cart/count', {
            baseURL: process.env.NEXT_STATIC_LEGACY_STORE_API_HOST,
            withCredentials: true,
            cancelToken: source.token,
            custom: { authorizationRequestType: OAuthRequestType.CHECK },
          }),
          { retries: 2 },
        );
        if (result.status === 200) {
          if (result.data.count) {
            setCartCount(result.data.count);
          }
        }
      } catch (error) {
        captureException(error);
      }
    };
    if (loggedUserInfo) {
      requestCartCount();
    }
    return source.cancel;
  }, [loggedUserInfo]);

  return cartCount;
};
