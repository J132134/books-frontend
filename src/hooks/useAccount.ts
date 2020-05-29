import { configureScope } from '@sentry/browser';
import libAxios, { CancelTokenSource, AxiosError } from 'axios';
import React from 'react';

import axios, { CancelToken, OAuthRequestType } from 'src/utils/axios';
import { CancelledError, runWithExponentialBackoff } from 'src/utils/backoff';
import Sentry from 'src/utils/sentry';
import { LoggedUser } from 'src/types/account';

export const AccountContext = React.createContext<LoggedUser | null>(null);

export async function checkLoggedIn(cancel: CancelTokenSource) {
  try {
    const { data } = await axios.get<LoggedUser>('/accounts/me', {
      baseURL: process.env.NEXT_STATIC_ACCOUNT_API,
      withCredentials: true,
      custom: {
        authorizationRequestType: OAuthRequestType.CHECK,
      },
      cancelToken: cancel.token,
    });
    return data;
  } catch (err) {
    if (libAxios.isCancel(err)) {
      throw new CancelledError();
    }
    if (err.response?.status === 401) {
      // Not logged in
      throw new CancelledError(err);
    }
    throw err;
  }
}

export function AccountProvider(props: { children?: React.ReactNode }) {
  const [account, setAccount] = React.useState<LoggedUser | null>(null);

  React.useEffect(() => {
    const cancel = CancelToken.source();
    runWithExponentialBackoff(
      () => checkLoggedIn(cancel),
      { maxTries: 3, backoffTimeUnit: 500 },
    ).then(
      setAccount,
      (err) => {
        if (err instanceof CancelledError) {
          if ((err.inner as AxiosError)?.response?.status === 401) {
            setAccount(null);
          }
          return;
        }
        Sentry.captureException(err);
      },
    );
    return () => cancel.cancel();
  }, []);

  React.useEffect(() => {
    configureScope((scope) => {
      scope.setUser(account);
    });
  }, [account]);

  return React.createElement(
    AccountContext.Provider,
    { value: account },
    props.children,
  );
}

export default function useAccount() {
  return React.useContext(AccountContext);
}
