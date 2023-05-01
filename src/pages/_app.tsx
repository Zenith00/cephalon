/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { AppProps } from "next/app";
import Head from "next/head";
import React from "react";
import { MantineProvider } from "@mantine/core";
import "../styles/styles.css";

export const App = (props: AppProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        theme={{
          globalStyles: (theme) => ({
            "*, *::before, *::after": {
              boxSizing: "border-box",
            },

            body: {
              ...theme.fn.fontStyles(),
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : theme.white,
              color:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[0]
                  : theme.black,
              lineHeight: theme.lineHeight,
            },

            ".mantine-NumberInput-input": {
              minHeight: "1.78rem",
              height: "1.78rem",
            },

            "#your-id > [data-active]": {
              backgroundColor: "pink",
            },
          }),
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
};
export default App;